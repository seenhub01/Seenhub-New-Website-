require 'socket'

class Api::PrintingController < ApplicationController
  def print
    user = User.find_by(id: params[:userId])
    return render json: { success: false, message: 'User authentication required for printing.' }, status: :unauthorized unless user
    return render json: { success: false, message: 'Insufficient printing credits. Please top up your account.' }, status: :payment_required if (user.printing_credits || 0) < 1

    file = params[:file]
    return render json: { success: false, message: 'No file provided' }, status: :bad_request unless file

    # PDF Validation
    pdf_data = file.read
    unless pdf_data[0..3] == "%PDF"
      return render json: { success: false, message: 'Invalid file format. Only PDF is allowed.' }, status: :bad_request
    end

    printer_ip = Setting.first&.printer_ip || '10.255.254.56'
    
    # Atomic locking mechanism using a file
    lock_file_path = Rails.root.join('tmp', 'printer.lock')
    lock_f = File.open(lock_file_path, File::CREAT | File::RDWR, 0644)
    locked = false
    attempts = 0

    while attempts < 15
      if lock_f.flock(File::LOCK_EX | File::LOCK_NB)
        locked = true
        break
      end
      sleep 2
      attempts += 1
    end

    unless locked
      lock_f.close
      return render json: { success: false, message: 'Printer is busy processing another job. Please wait.' }, status: :service_unavailable
    end

    begin
      # PJL Codes from legacy Next.js
      # 0x1b, 0x25, 0x2d, 0x31, 0x32, 0x38, 0x34, 0x34, 0x58 ( \e%-12844X )
      pjl_header = "\x1B\x25\x2D\x31\x32\x38\x34\x34\x58@PJL ENTER LANGUAGE=PDF\n".force_encoding('ASCII-8BIT')
      pjl_footer = "\x1B\x25\x2D\x31\x32\x38\x34\x34\x58".force_encoding('ASCII-8BIT')
      
      full_data = pjl_header + pdf_data + pjl_footer

      socket = TCPSocket.new(printer_ip, 9100)
      socket.write(full_data)
      
      # Give printer time to process as per legacy
      sleep 3
      socket.close

      # Calculate credits to deduct based on settings and pages
      pages = (params[:pages] || 1).to_f
      ratio = Setting.first&.print_credit_to_page_ratio || 2
      credits_to_deduct = pages / ratio

      # Success - deduct credit atomically
      user.reload
      user.update!(printing_credits: user.printing_credits - credits_to_deduct)
      
      # Record in bookings as a debit
      Booking.create!(
        booking_id: "PRT-#{Time.now.to_i.to_s[-6..-1]}",
        name: user.name,
        email: user.email,
        category: 'printing',
        space: "Printed: #{params[:fileName] || 'document.pdf'}",
        total: 0,
        printing_credits: -credits_to_deduct,
        status: 'Confirmed',
        date: Date.today,
        user: user
      )


      render json: { success: true, message: "#{params[:fileName] || 'document.pdf'} sent to printer! 📄✨", remainingCredits: user.printing_credits }
    rescue => e
      render json: { success: false, message: "Printer error: #{e.message}" }, status: :internal_server_error
    ensure
      if lock_f
        lock_f.flock(File::LOCK_UN)
        lock_f.close
      end
    end
  end
end

class Api::CafeInvoicesController < ApplicationController
  before_action :authenticate_admin!, except: [:create]
  skip_before_action :authenticate_user!, only: [:create]

  def index
    render json: formatted_invoices(CafeInvoice.all)
  end

  def create
    # Bug 15 Fix: snapshot unit_price + quantity at time of purchase
    # This ensures future product price changes never affect historical invoices
    snapped = invoice_params
    if snapped[:unit_price].blank? && snapped[:total].present? && snapped[:quantity].present?
      qty = snapped[:quantity].to_f
      snapped[:unit_price] = qty > 0 ? (snapped[:total].to_f / qty).round(2) : snapped[:total]
    end

    invoice = CafeInvoice.create(snapped)
    render json: { success: true, invoice: formatted_invoice(invoice) }
  end

  private

  def invoice_params
    params.permit(
      :invoiceId, :customerName, :customerEmail,
      :productName, :total, :date, :status,
      :unitPrice, :quantity
    ).transform_keys(&:underscore)
  end

  def formatted_invoice(invoice)
    invoice.as_json(except: [:created_at, :updated_at]).transform_keys { |k| k.camelize(:lower) }
  end

  def formatted_invoices(invoices)
    invoices.map { |i| formatted_invoice(i) }
  end
end

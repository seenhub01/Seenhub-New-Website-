require 'json'

ALL_MODULES = ['Admin Users', 'Accounts', 'Events', 'Analytics', 'Blogs', 'Booking', 'Cafe', 'Catalogs', 'Categories', 'Invoices', 'Landing page', 'Messages', 'Settings', 'Tax Rates', 'Translations', 'Frequently Asked Questions', 'Terms And Conditions', 'Copyrights', 'Privacy Policies', 'SEO']

def load_json(filename)
  file_path = Rails.root.join('..', 'seenhub-booking', 'data', filename)
  if File.exist?(file_path)
    JSON.parse(File.read(file_path))
  else
    puts "Warning: #{filename} not found at #{file_path}"
    nil
  end
end

def clean_data(model, data)
  d = data.transform_keys(&:underscore)
  d.delete('id')
  allowed_keys = model.column_names
  d.select { |k, v| allowed_keys.include?(k) }
end

puts "Cleaning database..."
# Use delete_all to be fast and thorough
[Analytic, Blog, Booking, CafeCategory, Coupon, Event, Locker, Membership, Message, PageContent, Refund, Setting, User, Workspace].each(&:delete_all)

puts "Seeding Users..."
users_data = load_json('users.json')
users_data&.each do |data|
  User.find_or_create_by!(email: data['email']) do |u|
    u.name = data['name']
    u.password = 'password123'
    u.phone = data['phone']
    u.printing_credits = data['printingCredits'] || 0
  end
end

puts "Seeding Lockers..."
lockers_data = load_json('lockers.json')
lockers_data&.uniq { |d| d['code'] }&.each do |data|
  Locker.create!(clean_data(Locker, data))
end

puts "Seeding Settings..."
settings_data = load_json('settings.json')
if settings_data
  Setting.create!(clean_data(Setting, settings_data))
end

puts "Seeding Coupons..."
coupons_data = load_json('coupons.json')
coupons_data&.uniq { |d| d['code'] }&.each do |data|
  Coupon.create!(clean_data(Coupon, data))
end

puts "Seeding Workspaces..."
workspaces_data = load_json('workspaces.json')
workspaces_data&.uniq { |d| d['name'] }&.each do |data|
  Workspace.create!(clean_data(Workspace, data))
end

puts "Seeding Memberships..."
memberships_data = load_json('memberships.json')
memberships_data&.uniq { |d| d['name'] }&.each do |data|
  Membership.create!(clean_data(Membership, data))
end

puts "Seeding Events..."
events_data = load_json('events.json')
events_data&.each do |data|
  Event.create!(clean_data(Event, data))
end

puts "Seeding Blogs..."
blogs_data = load_json('blogs.json')
blogs_data&.each do |data|
  Blog.create!(clean_data(Blog, data))
end

puts "Seeding Messages..."
messages_data = load_json('messages.json')
messages_data&.each do |data|
  Message.create!(clean_data(Message, data))
end

puts "Seeding Refunds..."
refunds_data = load_json('refunds.json')
refunds_data&.each do |data|
  Refund.create!(clean_data(Refund, data))
end

puts "Seeding Analytics..."
analytics_data = load_json('analytics.json')
analytics_data&.each do |data|
  Analytic.create!(clean_data(Analytic, data))
end

puts "Seeding Cafe Categories..."
categories_data = load_json('cafe_categories.json')
categories_data&.each do |data|
  CafeCategory.create!(name: data['name'])
end

puts "Seeding Page Contents..."
['landing', 'faq', 'legal', 'seo', 'translations', 'popup'].each do |name|
  data = load_json("#{name}.json")
  if data
    PageContent.create!(name: name, content: data)
  end
end

puts "Seeding Bookings (Last to ensure users exist)..."
bookings_data = load_json('bookings.json')
bookings_data&.each do |data|
  user = User.find_by(email: data['email'])
  params = clean_data(Booking, data)
  params[:user] = user if user
  Booking.create!(params)
end

puts "Seeding Admin Users..."
AdminUser.find_or_create_by!(email: 'admin@seenhub.ae') do |a|
  a.name = 'Super Admin'
  a.password = 'admin123'
  a.role = 'Super Admin'
  a.permissions = ALL_MODULES
end

puts "Seeding Complete! 🚀"

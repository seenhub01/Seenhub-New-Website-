# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_18_122225) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email"
    t.string "name"
    t.string "password_digest"
    t.text "permissions"
    t.string "role"
    t.datetime "updated_at", null: false
  end

  create_table "analytics", force: :cascade do |t|
    t.string "analytic_type"
    t.datetime "created_at", null: false
    t.string "device"
    t.string "ip"
    t.string "location"
    t.string "path"
    t.string "referrer"
    t.string "session_id"
    t.string "timestamp"
    t.datetime "updated_at", null: false
  end

  create_table "blogs", force: :cascade do |t|
    t.string "author"
    t.text "content"
    t.datetime "created_at", null: false
    t.date "date"
    t.text "image"
    t.string "subtitle"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "bookings", force: :cascade do |t|
    t.json "addons"
    t.string "applied_coupon"
    t.string "assigned_unit"
    t.string "booking_id"
    t.string "booking_type"
    t.date "calculated_end_date"
    t.string "category"
    t.string "coupon_code"
    t.datetime "created_at", null: false
    t.date "date"
    t.decimal "discount"
    t.decimal "discount_percent"
    t.string "duration_label"
    t.string "email"
    t.string "gate_number"
    t.integer "guests"
    t.string "locker_code"
    t.string "name"
    t.text "notes"
    t.string "phone"
    t.integer "printing_bundles"
    t.decimal "printing_credits"
    t.string "qr_code"
    t.string "service"
    t.string "space"
    t.decimal "space_subtotal"
    t.string "status"
    t.decimal "subtotal"
    t.decimal "tax"
    t.string "time"
    t.string "time_from"
    t.string "time_to"
    t.decimal "total"
    t.decimal "total_amount"
    t.integer "total_units"
    t.datetime "updated_at", null: false
    t.integer "user_id"
    t.index ["booking_id"], name: "index_bookings_on_booking_id"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "cafe_categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "cafe_invoices", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "customer_email"
    t.string "customer_name"
    t.string "date"
    t.string "invoice_id"
    t.string "product_name"
    t.string "status"
    t.decimal "total"
    t.datetime "updated_at", null: false
  end

  create_table "cafe_products", force: :cascade do |t|
    t.string "category"
    t.datetime "created_at", null: false
    t.text "description"
    t.text "image"
    t.string "name"
    t.decimal "price"
    t.string "status"
    t.datetime "updated_at", null: false
  end

  create_table "coupons", force: :cascade do |t|
    t.string "category"
    t.string "code"
    t.datetime "created_at", null: false
    t.decimal "discount"
    t.datetime "updated_at", null: false
  end

  create_table "email_broadcasts", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.integer "recipient_count"
    t.string "status"
    t.string "subject"
    t.datetime "timestamp"
    t.datetime "updated_at", null: false
  end

  create_table "events", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.date "end_date"
    t.string "end_time"
    t.string "event_type"
    t.string "gate_number"
    t.string "location"
    t.decimal "price"
    t.date "start_date"
    t.string "start_time"
    t.string "status"
    t.string "title"
    t.integer "total_tickets"
    t.datetime "updated_at", null: false
  end

  create_table "lockers", force: :cascade do |t|
    t.string "code"
    t.datetime "created_at", null: false
    t.string "name"
    t.decimal "price"
    t.string "status"
    t.datetime "updated_at", null: false
  end

  create_table "memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "desc"
    t.text "desc_thin"
    t.json "features"
    t.string "icon"
    t.json "images"
    t.decimal "price"
    t.string "slug"
    t.string "subtitle"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "messages", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "date"
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.text "message"
    t.string "query_type"
    t.string "status"
    t.datetime "updated_at", null: false
  end

  create_table "page_contents", force: :cascade do |t|
    t.json "content"
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "refunds", force: :cascade do |t|
    t.decimal "amount"
    t.string "booking_id"
    t.datetime "created_at", null: false
    t.string "currency"
    t.string "customer"
    t.string "refund_id"
    t.string "timestamp"
    t.datetime "updated_at", null: false
  end

  create_table "settings", force: :cascade do |t|
    t.string "contact_email"
    t.string "contact_phone"
    t.string "contact_whats_app"
    t.datetime "created_at", null: false
    t.string "currency"
    t.string "event_prefix"
    t.text "favicon"
    t.text "logo"
    t.string "membership_prefix"
    t.json "opening_hours"
    t.decimal "print_aed_to_credit_ratio"
    t.decimal "print_credit_to_page_ratio"
    t.decimal "print_min_top_up"
    t.string "printer_ip"
    t.string "qr_prefix"
    t.integer "qr_total_length"
    t.json "social_links"
    t.boolean "tax_enabled"
    t.decimal "tax_percentage"
    t.json "unit_prefixes"
    t.datetime "updated_at", null: false
    t.string "website_url"
    t.json "workspace_prefixes"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "dob"
    t.string "email"
    t.string "employment_status"
    t.string "name"
    t.string "otp_code"
    t.datetime "otp_expires_at"
    t.string "password_digest"
    t.string "phone"
    t.integer "printing_credits", default: 0
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "workspaces", force: :cascade do |t|
    t.json "booking_types"
    t.datetime "created_at", null: false
    t.text "description"
    t.json "extra_guest_price"
    t.string "featured_img"
    t.json "gallery"
    t.string "link"
    t.integer "max_guests"
    t.string "prefix"
    t.json "pricing"
    t.string "qr_prefix"
    t.string "subtitle"
    t.string "title"
    t.json "unit_names"
    t.json "unit_qr_prefixes"
    t.integer "units"
    t.datetime "updated_at", null: false
    t.json "working_hours"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "bookings", "users"
end

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    post 'auth/login', to: 'auth#login'
    post 'auth/register', to: 'auth#register'
    post 'auth/verify-otp', to: 'auth#verify_otp'
    post 'auth/forgot-password', to: 'auth#forgot_password'
    post 'auth/reset-password', to: 'auth#reset_password'
    post 'auth/resend-otp', to: 'auth#resend_otp'

    resources :users

    get 'lockers', to: 'lockers#index'
    post 'lockers', to: 'lockers#create_or_update'
    delete 'lockers', to: 'lockers#destroy'

    get 'settings', to: 'settings#index'
    post 'settings', to: 'settings#create_or_update'

    get 'bookings', to: 'bookings#index'
    post 'bookings', to: 'bookings#create_or_update'
    get 'bookings/calculate_price', to: 'bookings#calculate_price'
    delete 'bookings', to: 'bookings#destroy'

    get 'coupons', to: 'coupons#index'
    post 'coupons', to: 'coupons#create_or_update'
    post 'coupons/validate', to: 'coupons#validate'
    put 'coupons/:id', to: 'coupons#create_or_update'
    delete 'coupons', to: 'coupons#destroy'
    delete 'coupons/:id', to: 'coupons#destroy'

    get 'workspaces', to: 'workspaces#index'
    post 'workspaces', to: 'workspaces#create_or_update'
    delete 'workspaces', to: 'workspaces#destroy'

    get 'memberships', to: 'memberships#index'
    post 'memberships', to: 'memberships#create_or_update'
    delete 'memberships', to: 'memberships#destroy'

    get 'events', to: 'events#index'
    post 'events', to: 'events#create_or_update'
    put 'events/:id', to: 'events#create_or_update'
    delete 'events', to: 'events#destroy'
    delete 'events/:id', to: 'events#destroy'

    get 'blogs', to: 'blogs#index'
    post 'blogs', to: 'blogs#create_or_update'
    put 'blogs/:id', to: 'blogs#create_or_update'
    delete 'blogs', to: 'blogs#destroy'
    delete 'blogs/:id', to: 'blogs#destroy'

    # Generic Page Contents
    ['landing', 'faq', 'legal', 'seo', 'translations', 'popup'].each do |content_name|
      get content_name, to: 'page_contents#show', defaults: { name: content_name }
      post content_name, to: 'page_contents#create_or_update', defaults: { name: content_name }
    end

    get 'messages', to: 'messages#index'
    post 'messages', to: 'messages#create_or_update'
    delete 'messages', to: 'messages#destroy'

    get 'refunds', to: 'refunds#index'
    post 'refunds', to: 'refunds#create'

    get 'analytics', to: 'analytics#index'
    post 'analytics', to: 'analytics#create'

    get 'cafe_categories', to: 'cafe_categories#index'
    post 'cafe_categories', to: 'cafe_categories#create_or_update'
    delete 'cafe_categories', to: 'cafe_categories#destroy'
    delete 'cafe_categories/:id', to: 'cafe_categories#destroy'

    get 'cafe_products', to: 'cafe_products#index'
    post 'cafe_products', to: 'cafe_products#create_or_update'
    put 'cafe_products/:id', to: 'cafe_products#create_or_update'
    delete 'cafe_products', to: 'cafe_products#destroy'
    delete 'cafe_products/:id', to: 'cafe_products#destroy'
    
    get 'cafe_invoices', to: 'cafe_invoices#index'
    post 'cafe_invoices', to: 'cafe_invoices#create'

    get 'data', to: 'data#index'
    post 'data', to: 'data#create'

    post 'printing/print', to: 'printing#print'

    get 'emails/broadcast', to: 'email_broadcasts#index'
    post 'emails/broadcast', to: 'email_broadcasts#create'

    get 'verify/:id', to: 'bookings#show'

    namespace :admin do
      post 'login', to: 'auth#login'
      get 'auth/me', to: 'auth#me'
      
      get 'workspace_categories', to: 'workspaces#index'
      post 'workspace_categories', to: 'workspaces#create_or_update'
      put 'workspace_categories/:id', to: 'workspaces#create_or_update'
      delete 'workspace_categories/:id', to: 'workspaces#destroy'
      
      resources :admin_users
    end
  end
end

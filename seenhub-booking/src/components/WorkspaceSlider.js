"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

const defaultWH = { 
  Monday: { enabled: true, from: '08:00', to: '22:00' }, 
  Tuesday: { enabled: true, from: '08:00', to: '22:00' }, 
  Wednesday: { enabled: true, from: '08:00', to: '22:00' }, 
  Thursday: { enabled: true, from: '08:00', to: '22:00' }, 
  Friday: { enabled: true, from: '08:00', to: '17:00' }, 
  Saturday: { enabled: true, from: '08:00', to: '22:00' }, 
  Sunday: { enabled: true, from: '08:00', to: '22:00' } 
};
const defaultPricing = (h, d, w, m) => ({ hourly: { individual: h, corporate: Math.round(h * 1.5) }, daily: { individual: d, corporate: Math.round(d * 1.5) }, weekly: { individual: w, corporate: Math.round(w * 1.5) }, monthly: { individual: m, corporate: Math.round(m * 1.5) } });

const DEFAULT_WORKSPACES = [
  { 
    id: 1, 
    title: "Meeting Room", 
    subtitle: "Fully equipped for presentations", 
    description: "A professional and private space designed for productive discussions, presentations, and team meetings. Fully equipped with high-speed internet, presentation screens, and video conferencing tools.", 
    featuredImg: "/seenhub_meeting_room_1777453153762.png", 
    gallery: ["/seenhub_meeting_room_1777453153762.png", "/seenhub_manager_room_1777454051312.png"], 
    link: "/workspaces/meeting-room", 
    maxGuests: 12, 
    bookingTypes: ["Hourly", "Daily", "Weekly", "Monthly"], 
    pricing: defaultPricing(200, 1200, 5000, 15000), 
    extraGuestPrice: { individual: 50, corporate: 80 }, 
    workingHours: defaultWH 
  },
  { 
    id: 2, 
    title: "Manager Room", 
    subtitle: "Private executive suite", 
    description: "A private, fully equipped space to work, meet clients, and hold confidential discussions. Featuring high-speed internet, ergonomic furnishings, and a professional setting that ensures privacy.", 
    featuredImg: "/seenhub_manager_room_1777454051312.png", 
    gallery: ["/seenhub_manager_room_1777454051312.png", "/seenhub_meeting_room_1777453153762.png"], 
    link: "/workspaces/manager-room", 
    maxGuests: 4, 
    bookingTypes: ["Hourly", "Daily", "Weekly", "Monthly"], 
    pricing: defaultPricing(250, 1500, 6000, 18000), 
    extraGuestPrice: { individual: 60, corporate: 90 }, 
    workingHours: defaultWH 
  },
  { 
    id: 3, 
    title: "VIP Business Lounge", 
    subtitle: "Exclusive comfort for high-level meetings", 
    description: "An exclusive, high-comfort environment for elite networking and informal high-stakes meetings. Features premium amenities and a quiet, sophisticated atmosphere.", 
    featuredImg: "/seenhub_vip_lounge_1777453307436.png", 
    gallery: ["/seenhub_vip_lounge_1777453307436.png"], 
    link: "/workspaces/vip-business-lounge", 
    maxGuests: 20, 
    bookingTypes: ["Hourly", "Daily"], 
    pricing: defaultPricing(300, 1800, 0, 0), 
    extraGuestPrice: { individual: 80, corporate: 120 }, 
    workingHours: defaultWH 
  },
  { 
    id: 4, 
    title: "Work Booth (Double)", 
    subtitle: "Acoustic privacy for two", 
    description: "A private, soundproof space designed for focused teamwork, negotiations, and interviews. High-speed internet, ergonomic seating, professional lighting for video calls.", 
    featuredImg: "/seenhub_meeting_room_1777453153762.png", 
    gallery: ["/seenhub_meeting_room_1777453153762.png"], 
    link: "/workspaces/work-booth-double", 
    maxGuests: 2, 
    bookingTypes: ["Hourly", "Daily"], 
    pricing: defaultPricing(80, 480, 0, 0), 
    extraGuestPrice: { individual: 0, corporate: 0 }, 
    workingHours: defaultWH 
  },
  { 
    id: 5, 
    title: "Work booth (Single)", 
    subtitle: "Private acoustic pod for deep focus", 
    description: "A quiet, private space designed for deep focus and uninterrupted work. Sound-controlled for maximum concentration, equipped with professional lighting.", 
    featuredImg: "/seenhub_vip_lounge_1777453307436.png", 
    gallery: ["/seenhub_vip_lounge_1777453307436.png"], 
    link: "/workspaces/work-booth-single", 
    maxGuests: 1, 
    bookingTypes: ["Hourly", "Daily"], 
    pricing: defaultPricing(50, 300, 0, 0), 
    extraGuestPrice: { individual: 0, corporate: 0 }, 
    workingHours: defaultWH 
  },
  { 
    id: 6, 
    title: "ClassRoom", 
    subtitle: "Space for workshops and training", 
    description: "A fully equipped learning space featuring comfortable seating and advanced presentation tools, designed to support training sessions, workshops, professional courses.", 
    featuredImg: "/seenhub_modern_workspace_1777453051246.png", 
    gallery: ["/seenhub_modern_workspace_1777453051246.png", "/seenhub_meeting_room_1777453153762.png"], 
    link: "/workspaces/classroom", 
    maxGuests: 30, 
    bookingTypes: ["Hourly", "Daily", "Weekly", "Monthly"], 
    pricing: defaultPricing(150, 900, 3800, 12000), 
    extraGuestPrice: { individual: 30, corporate: 50 }, 
    workingHours: defaultWH 
  }
];

export default function WorkspaceSlider() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        // 1. Try to fetch from server
        const res = await fetch('/api/workspaces', { cache: 'no-store' });
        let serverWs = await res.json();
        if (!Array.isArray(serverWs)) {
          console.warn("API did not return an array for workspaces, using defaults.");
          serverWs = [];
        }

        // 2. Check if we have local data to sync (first time users or migrated data)
        let localWs = JSON.parse(localStorage.getItem('seenhub_workspaces') || '[]');
        
        if (serverWs.length === 0 && localWs.length > 0) {
          // Sync local to server
          await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localWs)
          });
          serverWs = localWs;
        } else if (serverWs.length === 0) {
          // Initialize with defaults
          serverWs = DEFAULT_WORKSPACES;
          // Note: POSTing here might fail if not authenticated, but we handle it as local state regardless
          fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serverWs)
          }).catch(() => {});
        }

        // 3. Migration: ensure rich data structure
        let needsUpdate = false;
        const migrated = (serverWs || []).map(ws => {
          if (!ws.pricing || !ws.subtitle) {
            needsUpdate = true;
            const richDefault = DEFAULT_WORKSPACES.find(d => d.title === ws.title || d.id === ws.id);
            if (richDefault) return { ...ws, ...richDefault };
            
            const h = 100;
            return { 
              ...ws, 
              subtitle: ws.desc || ws.subtitle || '', 
              description: ws.desc || ws.description || '', 
              featuredImg: ws.img || ws.featuredImg || '', 
              gallery: ws.gallery && ws.gallery.length ? ws.gallery : (ws.img ? [ws.img] : []), 
              maxGuests: ws.maxGuests || 10, 
              bookingTypes: ws.bookingTypes || ['Hourly', 'Daily', 'Weekly', 'Monthly'], 
              pricing: ws.pricing || defaultPricing(h, h*6, h*40, h*150), 
              extraGuestPrice: ws.extraGuestPrice || { individual: 0, corporate: 0 }, 
              workingHours: ws.workingHours || defaultWH 
            };
          }
          return ws;
        });

        if (needsUpdate) {
          await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(migrated)
          });
          serverWs = migrated;
        }

        setWorkspaces(serverWs);
        // Clear local storage to avoid confusing states, but keep it as a backup for now if preferred
        // localStorage.removeItem('seenhub_workspaces'); 
      } catch (e) {
        console.error("Failed to load workspaces:", e);
        // Fallback to local storage if API fails
        setWorkspaces(JSON.parse(localStorage.getItem('seenhub_workspaces') || '[]'));
      } finally {
        setIsLoaded(true);
      }
    };

    fetchWorkspaces();
  }, []);

  if (!isLoaded) return <div style={{ height: 280, background: '#f8fafc', borderRadius: 16 }}></div>;

  return (
    <div className="workspace-slider-box">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        loop={workspaces.length > 3} // Only loop if we have enough slides
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation={{
          nextEl: '.ctrl-btn-next',
          prevEl: '.ctrl-btn-prev',
        }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
        className="workspace-swiper-container"
      >
        {workspaces.map((ws) => (
          <SwiperSlide key={ws.id}>
            <Link href={`/workspaces/${ws.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`} className="workspace-item-card">
              <div className="item-img-box">
                <Image src={ws.featuredImg || ws.img} alt={ws.title} width={400} height={250} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="item-overlay">
                  <div>
                    <h3>{ws.title}</h3>
                    <p>{ws.subtitle || ws.desc}</p>
                  </div>
                  <span className="small-details-btn">More details</span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="slider-controls">
        <button className="ctrl-btn ctrl-btn-prev">
          <ChevronLeft size={20} />
        </button>
        <button className="ctrl-btn ctrl-btn-next">
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx global>{`
        .workspace-slider-box {
          position: relative;
          width: 100%;
          padding: 10px 0;
        }
        
        .workspace-swiper-container {
          width: 100%;
          overflow: hidden;
        }
        
        .workspace-item-card {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        
        .item-img-box {
          position: relative;
          height: 280px;
          border-radius: 16px;
          overflow: hidden;
          background: #eee;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .item-img-box:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }
        
        .item-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .item-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%);
          color: white;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-end;
        }
        
        .item-overlay h3 {
          font-size: 1.2rem;
          margin-bottom: 0.3rem;
          font-weight: 700;
          color: #fff;
        }
        
        .item-overlay p {
          font-size: 0.85rem;
          opacity: 0.85;
          margin: 0;
          line-height: 1.4;
        }

        .small-details-btn {
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          color: white;
          padding: 6px 12px;
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
          white-space: nowrap;
          margin-left: 10px;
        }

        .item-img-box:hover .small-details-btn {
          background: white;
          color: black;
        }
        
        .slider-controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2.5rem;
        }
        
        .ctrl-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        
        .ctrl-btn:hover {
          background: #000;
          color: #fff;
          border-color: #000;
          transform: scale(1.1);
        }

        .swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

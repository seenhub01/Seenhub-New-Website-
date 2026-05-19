"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-select-container" ref={selectRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={18} className="chevron" />
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown animate-fade-in">
          {options.map((option, index) => (
            <div 
              key={index}
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .custom-select-container {
          position: relative;
          width: 100%;
        }
        .custom-select-trigger {
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #ddd;
          background: #fbfbfb;
          font-size: 1rem;
          color: #888;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          user-select: none;
        }
        .custom-select-trigger.has-value {
          color: #2d2d2d;
          font-weight: 500;
        }
        .custom-select-trigger.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f0f0f0;
          border-color: #eee;
        }
        .custom-select-trigger:hover:not(.disabled), .custom-select-trigger.open {
          border-color: #2d2d2d;
          background: white;
          box-shadow: 0 5px 15px rgba(0,0,0,0.03);
        }
        .chevron {
          transition: transform 0.3s ease;
          color: #888;
        }
        .custom-select-trigger.open .chevron {
          transform: rotate(180deg);
        }
        .custom-select-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 1px solid #eee;
          z-index: 100;
          max-height: 250px;
          overflow-y: auto;
          padding: 0.5rem;
        }
        
        /* Custom scrollbar for dropdown */
        .custom-select-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        .custom-select-dropdown::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-select-dropdown::-webkit-scrollbar-thumb {
          background-color: #ddd;
          border-radius: 10px;
        }
        
        .custom-select-option {
          padding: 0.8rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          color: #444;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          margin-bottom: 2px;
        }
        .custom-select-option:last-child {
          margin-bottom: 0;
        }
        .custom-select-option:hover {
          background: #f4f4f4;
          color: #2d2d2d;
        }
        .custom-select-option.selected {
          background: #2d2d2d;
          color: white;
          font-weight: 500;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

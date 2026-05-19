
"use client";
import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Quote } from 'lucide-react';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    // Only update innerHTML if it's strictly different to prevent cursor jumping
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const sanitize = (html) => {
    if (!html) return '';
    // Basic XSS protection: Strip scripts and dangerous attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  };

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(sanitize(editorRef.current.innerHTML));
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(sanitize(editorRef.current.innerHTML));
    }
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) exec('insertImage', url);
  };

  const btnStyle = {
    background: 'transparent',
    border: 'none',
    padding: '0.4rem',
    cursor: 'pointer',
    color: '#475569',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.1s'
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
      <div style={{ 
        padding: '0.5rem', 
        borderBottom: '1px solid #e2e8f0', 
        background: '#f8fafc',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.2rem',
        alignItems: 'center'
      }}>
        <button type="button" onClick={() => exec('bold')} style={btnStyle} title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => exec('italic')} style={btnStyle} title="Italic"><Italic size={16} /></button>
        <button type="button" onClick={() => exec('underline')} style={btnStyle} title="Underline"><Underline size={16} /></button>
        <button type="button" onClick={() => exec('strikeThrough')} style={btnStyle} title="Strikethrough"><Strikethrough size={16} /></button>
        
        <div style={{ width: '1px', height: '1.2rem', background: '#cbd5e1', margin: '0 0.2rem' }} />
        
        <button type="button" onClick={() => exec('formatBlock', 'H1')} style={btnStyle} title="Heading 1"><Heading1 size={16} /></button>
        <button type="button" onClick={() => exec('formatBlock', 'H2')} style={btnStyle} title="Heading 2"><Heading2 size={16} /></button>
        <button type="button" onClick={() => exec('formatBlock', 'BLOCKQUOTE')} style={btnStyle} title="Quote"><Quote size={16} /></button>
        
        <div style={{ width: '1px', height: '1.2rem', background: '#cbd5e1', margin: '0 0.2rem' }} />
        
        <button type="button" onClick={() => exec('insertUnorderedList')} style={btnStyle} title="Bullet List"><List size={16} /></button>
        <button type="button" onClick={() => exec('insertOrderedList')} style={btnStyle} title="Numbered List"><ListOrdered size={16} /></button>
        
        <div style={{ width: '1px', height: '1.2rem', background: '#cbd5e1', margin: '0 0.2rem' }} />
        
        <button type="button" onClick={() => exec('justifyLeft')} style={btnStyle} title="Align Left"><AlignLeft size={16} /></button>
        <button type="button" onClick={() => exec('justifyCenter')} style={btnStyle} title="Align Center"><AlignCenter size={16} /></button>
        <button type="button" onClick={() => exec('justifyRight')} style={btnStyle} title="Align Right"><AlignRight size={16} /></button>
        
        <div style={{ width: '1px', height: '1.2rem', background: '#cbd5e1', margin: '0 0.2rem' }} />
        
        <button type="button" onClick={handleLink} style={btnStyle} title="Add Link"><Link size={16} /></button>
        <button type="button" onClick={handleImage} style={btnStyle} title="Add Image"><Image size={16} /></button>
      </div>

      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: '200px',
          padding: '1rem',
          outline: 'none',
          fontSize: '0.9rem',
          color: '#1e293b',
          lineHeight: '1.6'
        }}
      />
    </div>
  );
}

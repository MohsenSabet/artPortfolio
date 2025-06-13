// pages/dashboard/addPost.js
import { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaImage, FaPaperclip } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';

/* ─────────────────────────────
   React-Quill: defer CSS to client
───────────────────────────── */
const ReactQuill = dynamic(async () => {
  const { default: Quill } = await import('react-quill-new');
  if (typeof window !== 'undefined') {
    // theme JS needs document.* so load only in the browser
    await import('react-quill-new/dist/quill.snow.css');
  }
  return Quill;
}, { ssr: false });

/* date-picker (already safe) */
const ReactDatePicker = dynamic(() => import('react-datepicker'), { ssr: false });
import 'react-datepicker/dist/react-datepicker.css';

export default function AddPost() {
  const router = useRouter();

  /* ── auth gate ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, [router]);

  /* ── state ── */
  const [formData, setFormData] = useState({
    media: null,
    title: '',
    category: 'Painting',
    description: '',
    privacy: 'Public',
    includeDate: false,
    date: null,
    includeTime: false,
    time: '',
    featured: false,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false,
    message: '',
  });

  /* ── helpers ── */
  const handleChange = (e) => {
    const { name, files, value, type, checked } = e.target;
    if (type === 'file' && files) {
      const file = files[0];
      setFormData((p) => ({ ...p, media: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else if (type === 'checkbox') {
      setFormData((p) => ({ ...p, [name]: checked }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const removeMedia = () => {
    setFormData((p) => ({ ...p, media: null }));
    setPreviewUrl(null);
  };

  const clearForm = () => {
    setFormData({
      media: null,
      title: '',
      category: 'Painting',
      description: '',
      privacy: 'Public',
      includeDate: false,
      date: null,
      includeTime: false,
      time: '',
      featured: false,
    });
    setPreviewUrl(null);
    setErrors({});
    setStatus({ loading: false, error: null, success: false, message: '' });
  };

  const handleCancel = () => router.push('/dashboard');

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.media) newErrors.media = 'Please upload an image or video.';
    if (!formData.description) newErrors.description = 'Description is required.';
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setErrors({});
    setStatus({ loading: true, error: null, success: false, message: '' });

    /* auth check */
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus({ loading: false, error: 'Not authenticated', success: false });
      return;
    }

    /* ensure profile row */
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, email: session.user.email });
    if (profileError) {
      setStatus({ loading: false, error: profileError.message, success: false });
      return;
    }

    /* upload media if file */
    let mediaUrl = formData.media;
    if (formData.media instanceof File) {
      const fileExt = formData.media.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase
        .storage
        .from('posts')
        .upload(fileName, formData.media);
      if (uploadError) {
        setStatus({ loading: false, error: uploadError.message, success: false });
        return;
      }
      mediaUrl = supabase.storage.from('posts').getPublicUrl(fileName).data.publicUrl;
    }

    /* insert post */
    const { error: insertError } = await supabase.from('posts').insert({
      author_id: session.user.id,
      title: formData.title,
      media_url: mediaUrl,
      category: formData.category,
      privacy: formData.privacy,
      include_date: formData.includeDate,
      date: formData.includeDate ? formData.date : null,
      include_time: formData.includeTime,
      time: formData.includeTime ? formData.time : null,
      featured: formData.featured,
      description: formData.description,
    });

    if (insertError) {
      setStatus({ loading: false, error: insertError.message, success: false });
    } else {
      setStatus({ loading: false, success: true, message: 'Post added successfully!' });
      clearForm();
    }
  };

  /* ── Quill config ── */
  const quillModules = {
    toolbar: [
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ header: [1, 2, 3, 4, false] }],
      [{ align: [] }],
      ['clean'],
    ],
    keyboard: true,
  };
  const quillFormats = [
    'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'script', 'header', 'align',
  ];

  /* ── render ── */
  return (
    <div className="border rounded shadow-md bg-light">
      {/* alerts */}
      {status.error && <Alert variant="danger" className="m-3">{status.error}</Alert>}
      {status.success && <Alert variant="success" className="m-3">{status.message}</Alert>}

      {/* header */}
      <div className="d-flex align-items-center p-3 border-bottom">
        <FaArrowLeft size={20} className="me-3 cursor-pointer text-dark" onClick={handleCancel} />
        <h5 className="m-0 flex-grow-1 text-center text-dark">Create Post</h5>
        <div style={{ width: 20 }} />
      </div>

      {/* body */}
      <div className="p-3">
        {/* title */}
        <Form.Control
          type="text"
          placeholder="Post Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="border-1 fs-10 mb-3"
        />

        {/* description */}
        <ReactQuill
          theme="snow"
          modules={quillModules}
          formats={quillFormats}
          value={formData.description}
          onChange={(value) => setFormData((p) => ({ ...p, description: value }))}
          className="mb-3 resizable-quill"
        />

        {/* toolbar */}
        <div className="d-flex align-items-center mt-3 flex-wrap">
          {/* media upload icon */}
          <label htmlFor="mediaUpload" className="me-0 mb-0 cursor-pointer text-secondary">
            <FaImage size={20} />
          </label>
          <Form.Control
            id="mediaUpload"
            type="file"
            name="media"
            accept="image/*,video/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          {/* attachment icon (placeholder for future use) */}
          <FaPaperclip className="ms-2 me-auto cursor-pointer text-secondary" size={20} />

          {/* privacy select */}
          <Form.Group controlId="formPrivacy" className="d-flex align-items-center m-0 mb-2">
            <Form.Label className="me-2 mb-0 text-dark">Privacy</Form.Label>
            <Form.Select size="sm" name="privacy" value={formData.privacy} onChange={handleChange}>
              <option>Public</option>
              <option>Private</option>
              <option>Unlisted</option>
            </Form.Select>
          </Form.Group>

          {/* category select */}
          <Form.Group controlId="formCategory" className="d-flex align-items-center m-0 ms-4 mb-2">
            <Form.Label className="me-2 mb-0 text-dark">Category</Form.Label>
            <Form.Select size="sm" name="category" value={formData.category} onChange={handleChange}>
              <option>Painting</option>
              <option>Illustration</option>
              <option>Photography</option>
              <option>Digital</option>
              <option>Life & Gesture Study</option>
              <option>Character & Creature</option>
              <option>Environment & Worldbuilding</option>
              <option>Concept & Experimental</option>
              <option>Watercolor Study</option>
              <option>Ink & Linework</option>
              <option>Marker Illustration</option>
              <option>Traditional Mixed Media</option>
              <option>Digital Illustration</option>
              <option>Gesture & Life Study</option>
              <option>Colour & Rendering</option>
              <option>Concept / Experimental</option>
            </Form.Select>
          </Form.Group>

          {/* include date */}
          <Form.Check
            className="ms-4 text-dark mb-2"
            type="checkbox"
            label="Include Date"
            name="includeDate"
            checked={formData.includeDate}
            onChange={handleChange}
          />
          {formData.includeDate && (
            <ReactDatePicker
              selected={formData.date}
              onChange={(date) => setFormData((p) => ({ ...p, date }))}
              dateFormat="yyyy-MM-dd"
              className="form-control form-control-sm ms-2 mb-2"
            />
          )}

          {/* include time (toggle via includeTime in state) */}
          {formData.includeTime && (
            <Form.Control
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              size="sm"
              className="ms-2 mb-2"
            />
          )}

          {/* featured */}
          <Form.Check
            className="ms-4 text-dark mb-2"
            type="checkbox"
            label="Featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
          />
        </div>

        {/* preview */}
        {previewUrl && (
          <div className="d-flex gap-2 mt-3">
            <div className="position-relative">
              <img
                src={previewUrl}
                alt="preview"
                className="rounded"
                style={{ width: 80, height: 80, objectFit: 'cover' }}
              />
              <Button
                variant="light"
                size="sm"
                className="position-absolute top-0 end-0 p-0"
                onClick={removeMedia}
              >
                ×
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="d-flex justify-content-end p-3 border-top bg-light">
        <Button variant="outline-secondary" onClick={clearForm} className="me-2">
          Clear
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={status.loading}>
          {status.loading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}

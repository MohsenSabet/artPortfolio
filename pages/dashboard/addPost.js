import { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaImage, FaPaperclip } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';

export default function AddPost() {
  const router = useRouter();
  const [formData, setFormData] = useState({ media: null, title: '', category: 'Painting', description: '', privacy: 'Public', includeDate: false, date: '', includeTime: false, time: '', featured: false });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, error: null, success: false, message: '' });

  const handleChange = (e) => {
    const { name, files, value, type, checked } = e.target;
    if (type === 'file' && files) {
      const file = files[0]; setFormData(prev => ({ ...prev, media: file })); setPreviewUrl(URL.createObjectURL(file));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeMedia = () => { setFormData(prev => ({ ...prev, media: null })); setPreviewUrl(null); };

  const handleClear = () => { setFormData({ media: null, title: '', category: 'Painting', description: '', privacy: 'Public', includeDate: false, date: '', includeTime: false, time: '', featured: false }); setPreviewUrl(null); setErrors({}); setStatus({ loading: false, error: null, success: false, message: '' }); };
  const handleCancel = () => router.push('/dashboard');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.media) newErrors.media = 'Please upload an image or video.';
    if (!formData.description) newErrors.description = 'Description is required.';
    if (Object.keys(newErrors).length) return setErrors(newErrors);
    setErrors({});
    setStatus({ loading: true, error: null, success: false, message: '' });
    // Upload media file to Supabase Storage bucket 'posts'
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Supabase session:', session);
    console.log('Session user ID:', session?.user?.id);
    console.log('Session access token:', session?.access_token);
    if (!session) {
      setStatus({ loading: false, error: 'Not authenticated', success: false, message: '' });
      return;
    }
    // Ensure profile exists to satisfy posts.author_id foreign key
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, email: session.user.email });
    if (profileError) {
      setStatus({ loading: false, error: profileError.message, success: false, message: '' });
      return;
    }
    let mediaUrl;
    if (formData.media instanceof File) {
      const fileExt = formData.media.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, formData.media);
      if (uploadError) {
        setStatus({ loading: false, error: uploadError.message, success: false, message: '' });
        return;
      }
      const { data } = supabase.storage.from('posts').getPublicUrl(fileName);
      mediaUrl = data.publicUrl;
    } else {
      mediaUrl = formData.media;
    }
    // Insert post record
    const postObj = {
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
      description: formData.description
    };
    console.log('Inserting post object:', postObj);
    const { data: insertData, error: insertError } = await supabase.from('posts').insert(postObj);
    console.log('Insert response data:', insertData, 'error:', insertError);
    if (insertError) {
      setStatus({ loading: false, error: insertError.message, success: false, message: '' });
    } else {
      // confirmation
      setStatus({ loading: false, error: null, success: true, message: 'Post added successfully!' });
      // clear form
      setFormData({ media: null, title: '', category: 'Painting', description: '', privacy: 'Public', includeDate: false, date: '', includeTime: false, time: '', featured: false });
      setPreviewUrl(null);
    }
  };

  // Quill configuration: enable fonts, sizes, formatting, and keyboard, no file attachments
  const quillModules = {
    toolbar: [
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'header': [1, 2, 3, 4, false] }],
      [{ 'align': [] }],
      ['clean']
    ],
    keyboard: true
  };
  const quillFormats = ['font', 'size', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'script', 'header', 'align'];

  return (
    <div className="border rounded shadow-md bg-light">
      {status.error && <Alert variant="danger" className="m-3">{status.error}</Alert>}
      {status.success && <Alert variant="success" className="m-3">{status.message}</Alert>}
      {/* Header */}
      <div className="d-flex align-items-center p-3 border-bottom">
        <FaArrowLeft className="me-3 cursor-pointer text-dark" size={20} onClick={handleCancel} />
        <h5 className="m-0 flex-grow-1 text-center text-dark">Create Post</h5>
        <div style={{ width: 20 }} />
      </div>
      {/* Body */}
      <div className="p-3">
        {/* Title */}
        <Form.Control type="text" placeholder="Post Title" name="title" value={formData.title} onChange={handleChange} className="border-1 fs-10  mb-3" />
        {/* Description with ReactQuill */}
        <ReactQuill
          theme="snow"
          modules={quillModules}
          formats={quillFormats}
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          className="mb-3 resizable-quill"
        />
        {/* Icon bar */}
        <div className="d-flex align-items-center mt-3 flex-wrap">
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
          <FaPaperclip className="ms-2 me-auto cursor-pointer text-secondary" size={20} />
          <Form.Group controlId="formPrivacy" className="d-flex align-items-center m-0 mb-2">
            <Form.Label className="me-2 mb-0 text-dark">Privacy</Form.Label>
            <Form.Select size="sm" name="privacy" value={formData.privacy} onChange={handleChange}>
              <option>Public</option>
              <option>Private</option>
              <option>Unlisted</option>
            </Form.Select>
          </Form.Group>
          {/* Category and Options */}
          <Form.Group controlId="formCategory" className="d-flex align-items-center m-0 ms-4 mb-2">
            <Form.Label className="me-2 mb-0 text-dark">Category</Form.Label>
            <Form.Select size="sm" name="category" value={formData.category} onChange={handleChange}>
              <option>Painting</option>
              <option>Illustration</option>
              <option>Photography</option>
              <option>Digital</option>
              <option>Other</option>
            </Form.Select>
          </Form.Group>
          <Form.Check className="ms-4 text-dark mb-2" type="checkbox" label="Include Date" name="includeDate" checked={formData.includeDate} onChange={handleChange} />
          {formData.includeDate && <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} size="sm" className="ms-2 mb-2" />}
          {formData.includeTime && <Form.Control type="time" name="time" value={formData.time} onChange={handleChange} size="sm" className="ms-2 mb-2" />}
          <Form.Check className="ms-4 text-dark mb-2" type="checkbox" label="Featured" name="featured" checked={formData.featured} onChange={handleChange} />
        </div>
        {/* Preview */}
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
              >×</Button>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="d-flex justify-content-end p-3 border-top bg-light">
        <Button variant="outline-secondary" onClick={handleClear} className="me-2">Clear</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={status.loading}>{status.loading ? 'Publishing...' : 'Publish'}</Button>
      </div>
    </div>
  );
}
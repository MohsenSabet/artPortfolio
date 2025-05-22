import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Container } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({ title: '', media_url: '', category: 'Painting', privacy: 'Public', include_date: false, date: '', include_time: false, time: '', featured: false, description: '' });
  const [status, setStatus] = useState({ loading: false, error: null });
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Quill modules/formats
  const quillModules = { /* same as AddPost toolbar config */
    toolbar: [[{ 'font': [] }], [{ 'size': ['small', false, 'large', 'huge'] }], ['bold','italic','underline','strike'], [{ 'color': [] }, { 'background': [] }], [{ 'script': 'sub' },{ 'script': 'super' }], [{ 'header': [1,2,3,4,false] }], [{ 'align': [] }], ['clean']], keyboard: true };
  const quillFormats = ['font','size','bold','italic','underline','strike','color','background','script','header','align'];

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (error) {
        setStatus({ loading: false, error: error.message });
      } else {
        setFormData(data);
        setPreviewUrl(data.media_url);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') setFormData(prev => ({ ...prev, [name]: checked }));
    else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });
    let updatedUrl = formData.media_url;
    // get user session for storage path
    const { data: { session } } = await supabase.auth.getSession();
    // if new file selected, upload to storage
    if (mediaFile && session) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, mediaFile);
      if (uploadError) {
        setStatus({ loading: false, error: uploadError.message });
        return;
      }
      const { data: urlData } = supabase.storage.from('posts').getPublicUrl(fileName);
      updatedUrl = urlData.publicUrl;
    }
    const updateObj = { ...formData, media_url: updatedUrl };
    const { error } = await supabase.from('posts').update(updateObj).eq('id', id);
    if (error) setStatus({ loading: false, error: error.message });
    else router.push('/dashboard/managePost');
  };

  return (
    <Container className="mt-5">
      <h2>Edit Post</h2>
      {status.error && <Alert variant="danger">{status.error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title" className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control name="title" value={formData.title} onChange={handleChange} />
        </Form.Group>

        <Form.Group controlId="media" className="mb-3">
          <Form.Label>Media File</Form.Label>
          <Form.Control type="file" accept="image/*,video/*" onChange={handleFileChange} />
        </Form.Group>
        {previewUrl && (
          /\.(mp4|webm|ogg|mov)$/i.test(previewUrl) ? (
            <video controls src={previewUrl} className="img-fluid rounded mb-3" style={{ objectFit: 'cover', width: '100%', maxHeight: '300px' }} />
          ) : (
            <img src={previewUrl} alt="Preview" className="img-fluid rounded mb-3" style={{ objectFit: 'cover', width: '100%', maxHeight: '300px' }} />
          )
        )}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleChange}>
                <option>Painting</option><option>Illustration</option><option>Photography</option><option>Digital</option><option>Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="privacy">
              <Form.Label>Privacy</Form.Label>
              <Form.Select name="privacy" value={formData.privacy} onChange={handleChange}>
                <option>Public</option><option>Private</option><option>Unlisted</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Check type="checkbox" label="Include Date" name="include_date" checked={formData.include_date} onChange={handleChange} />
        {formData.include_date && (
          <ReactDatePicker
            selected={formData.date ? new Date(formData.date) : null}
            onChange={(date) => setFormData(prev => ({ ...prev, date }))}
            dateFormat="yyyy-MM-dd"
            className="form-control mb-3"
          />
        )}

        <Form.Check type="checkbox" label="Include Time" name="include_time" checked={formData.include_time} onChange={handleChange} />
        {formData.include_time && <Form.Control type="time" name="time" value={formData.time} onChange={handleChange} className="mb-3" />}

        <Form.Check type="checkbox" label="Featured" name="featured" checked={formData.featured} onChange={handleChange} className="mb-3" />

        <Form.Group controlId="description" className="mb-3">
          <Form.Label>Description</Form.Label>
          <ReactQuill theme="snow" modules={quillModules} formats={quillFormats} value={formData.description} onChange={value => setFormData(prev => ({ ...prev, description: value }))} />
        </Form.Group>

        <Button type="submit" disabled={status.loading}>{status.loading ? 'Saving...' : 'Save Changes'}</Button>
      </Form>
    </Container>
  );
}
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({ title: '', media_url: '', category: 'Painting', privacy: 'Public', include_date: false, date: '', include_time: false, time: '', featured: false, description: '' });
  const [status, setStatus] = useState({ loading: false, error: null });

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
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') setFormData(prev => ({ ...prev, [name]: checked }));
    else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });
    const { error } = await supabase.from('posts').update(formData).eq('id', id);
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

        <Form.Group controlId="media_url" className="mb-3">
          <Form.Label>Media URL</Form.Label>
          <Form.Control name="media_url" value={formData.media_url} onChange={handleChange} />
        </Form.Group>

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
        {formData.include_date && <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} className="mb-3" />}

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
import dynamic from 'next/dynamic';
import { FaArrowLeft } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Container } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

// Browser-only imports:
const ReactQuill = dynamic(
  async () => {
    const { default: Quill } = await import('react-quill-new');
    if (typeof window !== 'undefined') {
      await import('react-quill-new/dist/quill.snow.css');
    }
    return Quill;
  },
  { ssr: false }
);

const ReactDatePicker = dynamic(
  () => import('react-datepicker'),
  { ssr: false }
);

function EditPost() {
  const router = useRouter();
  const { id } = router.query;

  // cancel handler
  const handleCancel = () => router.push('/dashboard/managePost');

  const [formData, setFormData] = useState({
    title: '',
    media_url: '',
    category: 'Painting',
    privacy: 'Public',
    include_date: false,
    date: '',
    featured: false,
    description: '',
  });
  const [status, setStatus] = useState({ loading: false, error: null });
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Inject datepicker CSS only in browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/react-datepicker/dist/react-datepicker.css';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const quillModules = {
    toolbar: [
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold','italic','underline','strike'],
      [{ color: [] },{ background: [] }],
      [{ script: 'sub' },{ script: 'super' }],
      [{ header: [1,2,3,4,false] }],
      [{ align: [] }],
      ['clean'],
    ],
    keyboard: true,
  };
  const quillFormats = [
    'font','size','bold','italic','underline','strike',
    'color','background','script','header','align'
  ];

  // Fetch existing post
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) setStatus({ loading: false, error: error.message });
      else {
        setFormData(data);
        setPreviewUrl(data.media_url);
      }
    })();
  }, [id, router]);

  // Input/change handlers
  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file' && files?.[0]) {
      setMediaFile(files[0]);
      setPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setFormData(p => ({
        ...p,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Submit
  const handleSubmit = async e => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus({ loading: false, error: 'Not authenticated' });
      return;
    }

    let mediaUrl = formData.media_url;
    if (mediaFile) {
      if (mediaUrl?.includes('/posts/')) {
        const oldPath = mediaUrl.split('/posts/')[1];
        await supabase.storage.from('posts').remove([oldPath]).catch(() => {});
      }
      const ext = mediaFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } =
        await supabase.storage.from('posts').upload(fileName, mediaFile);
      if (uploadError) {
        setStatus({ loading: false, error: uploadError.message });
        return;
      }
      mediaUrl = supabase.storage
        .from('posts')
        .getPublicUrl(fileName).data.publicUrl;
    }

    const { error } = await supabase
      .from('posts')
      .update({ ...formData, media_url: mediaUrl })
      .eq('id', id);

    if (error) setStatus({ loading: false, error: error.message });
    else router.push('/dashboard/managePost');
  };

  return (
    <div className="border rounded shadow bg-light mt-4 text-dark">
      {/* header */}
      <div className="d-flex align-items-center p-2 border-bottom">
        <FaArrowLeft size={20} className="me-3 cursor-pointer text-dark" onClick={handleCancel} />
        <h5 className="m-0 flex-grow-1 text-center text-dark">Edit Post</h5>
        <div style={{ width: 15 }} />
      </div>
      {/* body */}
      <div className="p-2 text-dark">
        {status.error && <Alert variant="danger">{status.error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Title */}
          <Form.Group controlId="title" className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Media File */}
          <Form.Group controlId="media" className="mb-3">
            <Form.Label>Media File</Form.Label>
            <Form.Control
              type="file"
              accept="image/*,video/*"
              onChange={handleChange}
            />
          </Form.Group>

          {/* Preview */}
          {previewUrl && (
            /\.(mp4|webm|ogg|mov)$/i.test(previewUrl)
              ? <video
                  controls
                  src={previewUrl}
                  className="img-fluid rounded mb-3"
                  style={{ objectFit:'cover', width:'100%', maxWidth:400, maxHeight:300 }}
                />
              : <img
                  src={previewUrl}
                  alt="Preview"
                  className="img-fluid rounded mb-3"
                  style={{ objectFit:'cover', width:'100%', maxWidth:400, maxHeight:300 }}
                />
          )}

          {/* Category & Privacy */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {/* your <option> list */}
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
                  <option>Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="privacy">
                <Form.Label>Privacy</Form.Label>
                <Form.Select
                  name="privacy"
                  value={formData.privacy}
                  onChange={handleChange}
                >
                  <option>Public</option>
                  <option>Private</option>
                  <option>Unlisted</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Include Date */}
          <Form.Check
            type="checkbox"
            label="Include Date"
            name="include_date"
            checked={formData.include_date}
            onChange={handleChange}
          />
          {formData.include_date && (
            <ReactDatePicker
              selected={formData.date ? new Date(formData.date) : null}
              onChange={date => setFormData(p => ({ ...p, date }))}
              dateFormat="yyyy-MM-dd"
              className="form-control mb-3"
            />
          )}

          {/* Featured */}
          <Form.Check
            type="checkbox"
            label="Featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="mb-3"
          />

          {/* Description */}
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <ReactQuill
              theme="snow"
              modules={quillModules}
              formats={quillFormats}
              value={formData.description}
              onChange={v => setFormData(p => ({ ...p, description: v }))}
            />
          </Form.Group>

          <Button type="submit" disabled={status.loading}>
            {status.loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </Form>
      </div>
    </div>
  );
}

// Wrap the page as client-only so Next.js never SSRs it
export default dynamic(
  () => Promise.resolve(EditPost),
  { ssr: false }
);

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Container, Card, Form, Button, Row, Col, Alert, Modal } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const [initialAvatarPath, setInitialAvatarPath] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [instagram, setInstagram] = useState('');
  const [mediums, setMediums] = useState([]);
  const [newMedium, setNewMedium] = useState('');
  const [portfolioIntro, setPortfolioIntro] = useState('');
  const [userId, setUserId] = useState(null);
  // Password change state (inline)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);

  // Preset medium options
  const presetMediums = ['Painting', 'Illustration', 'Photography', 'Digital', 'Other'];

  // Toggle a medium in the list
  const toggleMedium = (m) => {
    setMediums(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  // Fetch profile on mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUserId(session.user.id);
      const userId = session.user.id;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        setError(error.message);
      } else {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setUsername(data.username || '');
        setPronouns(data.pronouns || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
        setProfilePic(data.avatar_url || 'https://via.placeholder.com/200');
        // store initial avatar storage path for deletion later
        if (data.avatar_url && data.avatar_url.includes('/avatars/')) {
          const path = data.avatar_url.split('/avatars/')[1];
          setInitialAvatarPath(path);
        }
        setTwitter(data.twitter || '');
        setLinkedIn(data.linkedin || '');
        setInstagram(data.instagram || '');
        setMediums(data.mediums ? data.mediums.split(',') : []);
        setPortfolioIntro(data.portfolio_intro || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPwError(null);
    setPwSuccess(false);

    // If a new profile image was selected, upload it to storage and get its public URL
    let avatar_url = profilePic;
    if (profileFile) {
      const fileExt = profileFile.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      const { error: storageError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, profileFile, { upsert: true });
      if (storageError) {
        // Inform user if bucket is missing
        if (storageError.message.toLowerCase().includes('bucket not found')) {
          setError("Storage bucket 'avatars' not found. Please create it in your Supabase dashboard under Storage > Buckets.");
        } else {
          setError(storageError.message);
        }
        return;
      }
      // remove old avatar from storage
      if (initialAvatarPath) {
        const { error: removeError } = await supabase.storage.from('avatars').remove([initialAvatarPath]);
        if (removeError) console.error('Error removing old avatar:', removeError.message);
      }
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      avatar_url = publicUrl;
      setProfilePic(publicUrl);
    }

    // Build updates with storage URL instead of blob
    const updates = {
      first_name: firstName,
      last_name: lastName,
      username,
      pronouns,
      email,
      phone,
      avatar_url,
      bio,
      twitter,
      linkedin: linkedIn,
      instagram,
      mediums: mediums.join(','),
      portfolio_intro: portfolioIntro
    };
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    // If password fields filled, update password
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPwError('Passwords do not match');
      } else {
        const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
        if (pwErr) setPwError(pwErr.message);
        else setPwSuccess(true);
      }
    }
    // Redirect after profile update
    router.push('/dashboard/profile');
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setShowPwModal(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Profile updated!</Alert>}
      {pwError && <Alert variant="danger">{pwError}</Alert>}
      {pwSuccess && <Alert variant="success">Password updated successfully!</Alert>}

      {/* Edit Profile Card */}
      <Card style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Card.Header as="h4" className="d-flex justify-content-between align-items-center">
          Edit Profile
        </Card.Header>
        <Form onSubmit={handleSubmit}>
          <Card.Body>
            <Form.Group controlId="profilePic" className="mb-3 text-center">
              <Form.Label>Profile Picture</Form.Label>
              <div className="mb-2">
                <img src={profilePic} alt="Preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setProfileFile(file);
                    setProfilePic(URL.createObjectURL(file));
                  }
                }}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId="firstName" className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName" className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="username" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="pronouns" className="mb-3">
                  <Form.Label>Pronouns</Form.Label>
                  <Form.Control type="text" value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="bio" className="mb-3">
              <Form.Label>Biography</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="portfolioIntro" className="mb-3">
              <Form.Label>Portfolio Introduction</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={portfolioIntro}
                onChange={(e) => setPortfolioIntro(e.target.value)}
                placeholder="Short introduction for portfolio page"
              />
            </Form.Group>

            <Form.Group controlId="socialLinks" className="mb-3">
              <Form.Label>Social Media Links</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    placeholder="Twitter URL"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="LinkedIn URL"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Instagram URL"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group controlId="mediums" className="mb-4">
              <Form.Label>Mediums (select presets or add custom)</Form.Label>
              <div className="mb-2">
                {/* Preset options */}
                {presetMediums.map((m) => (
                  <Button
                    key={m}
                    variant={mediums.includes(m) ? 'primary' : 'outline-primary'}
                    size="sm"
                    className="me-2 mb-2"
                    onClick={() => toggleMedium(m)}
                  >{m}</Button>
                ))}
                {/* Custom mediums */}
                {mediums.filter(m => !presetMediums.includes(m)).map((m) => (
                  <Button
                    key={m}
                    variant="success"
                    size="sm"
                    className="me-2 mb-2"
                    onClick={() => toggleMedium(m)}
                  >{m}</Button>
                ))}
              </div>
              <Row>
                <Col>
                  <Form.Control
                    placeholder="Add new medium"
                    value={newMedium}
                    onChange={(e) => setNewMedium(e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button onClick={() => {
                    const trimmed = newMedium.trim();
                    if (trimmed && !mediums.includes(trimmed)) {
                      setMediums(prev => [...prev, trimmed]);
                      setNewMedium('');
                    }
                  }} size="sm">Add</Button>
                </Col>
              </Row>
            </Form.Group>

            <div className="d-flex justify-content-end">
             {/* Change password trigger */}
             <Button variant="warning" onClick={() => setShowPwModal(true)}>Change Password</Button>
            </div>
          </Card.Body>
           <Card.Footer className="d-flex justify-content-between">
             {/* Cancel edits */}
             <Link href="/dashboard/profile" passHref>
               <Button variant="outline-secondary">Cancel</Button>
             </Link>
             <Button variant="success" type="submit">Save Changes</Button>
           </Card.Footer>
          </Form>
         </Card>

        {/* Password Change Modal */}
        <Modal show={showPwModal} onHide={() => setShowPwModal(false)} backdrop="static" centered>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {pwError && <Alert variant="danger">{pwError}</Alert>}
            {pwSuccess && <Alert variant="success">Password updated!</Alert>}
            <Form>
              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </Form.Group>
              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPwModal(false)}>Close</Button>
            <Button variant="primary" onClick={() => { setPwError(null); setPwSuccess(false); handlePasswordChange(); }}>
              Update Password
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
}

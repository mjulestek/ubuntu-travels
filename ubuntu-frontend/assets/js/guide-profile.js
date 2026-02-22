"use strict";

const form = document.getElementById('profileForm');
const message = document.getElementById('message');
const profileImageInput = document.getElementById('profileImageInput');
const profileImagePreview = document.getElementById('profileImagePreview');
const profileImagePlaceholder = document.getElementById('profileImagePlaceholder');
const loadingOverlay = document.getElementById('loadingOverlay');

let uploadedImageUrl = '';

// Character counters
const shortIntroInput = form.querySelector('[name="shortIntro"]');
const bioInput = form.querySelector('[name="bio"]');
const shortIntroCount = document.getElementById('shortIntroCount');
const bioCount = document.getElementById('bioCount');

shortIntroInput.addEventListener('input', () => {
    shortIntroCount.textContent = shortIntroInput.value.length;
});

bioInput.addEventListener('input', () => {
    bioCount.textContent = bioInput.value.length;
});

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) {
        window.location.href = './auth.html?role=guide';
        return null;
    }
    
    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            localStorage.removeItem('AUTH_TOKEN');
            window.location.href = './auth.html?role=guide';
            return null;
        }
        
        const data = await res.json();
        if (data.user.role !== 'guide') {
            window.location.href = './index.html';
            return null;
        }
        
        return data.user;
    } catch (err) {
        console.error('Auth check failed:', err);
        window.location.href = './auth.html?role=guide';
        return null;
    }
}

// Load current profile data
async function loadProfile() {
    const user = await checkAuth();
    if (!user) return;
    
    // Fill form with current data
    form.firstName.value = user.firstName || '';
    form.lastName.value = user.lastName || '';
    form.phone.value = user.phone || '';
    form.country.value = user.country || '';
    form.city.value = user.city || '';
    form.shortIntro.value = user.shortIntro || '';
    form.bio.value = user.bio || '';
    form.companyName.value = user.companyName || '';
    form.businessType.value = user.businessType || '';
    form.yearsOfExperience.value = user.yearsOfExperience || 0;
    
    // Update character counts
    shortIntroCount.textContent = (user.shortIntro || '').length;
    bioCount.textContent = (user.bio || '').length;
    
    // Set profile image
    if (user.profileImage) {
        uploadedImageUrl = user.profileImage;
        profileImagePreview.src = user.profileImage;
        profileImagePreview.style.display = 'block';
        profileImagePlaceholder.style.display = 'none';
    }
    
    // Check languages
    if (user.languages && Array.isArray(user.languages)) {
        user.languages.forEach(lang => {
            const checkbox = form.querySelector(`input[name="languages"][value="${lang}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Check specializations
    if (user.specializations && Array.isArray(user.specializations)) {
        user.specializations.forEach(spec => {
            const checkbox = form.querySelector(`input[name="specializations"][value="${spec}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// Resize image to max dimensions while maintaining aspect ratio
function resizeImage(file, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve, reject) => {
        console.log('Resizing image:', file.name, file.type);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                console.log('Original dimensions:', img.width, 'x', img.height);
                
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                console.log('New dimensions:', width, 'x', height);
                
                // Create canvas and resize
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create image blob'));
                        return;
                    }
                    
                    console.log('Blob created:', blob.size, 'bytes');
                    
                    // Create new file from blob
                    const newFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    resolve(newFile);
                }, 'image/jpeg', 0.9);
            };
            
            img.onerror = (err) => {
                console.error('Image load error:', err);
                reject(new Error('Failed to load image. Please try a different image.'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = (err) => {
            console.error('FileReader error:', err);
            reject(new Error('Failed to read file. Please try again.'));
        };
        
        reader.readAsDataURL(file);
    });
}

// Handle image upload
profileImageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type - accept common image formats
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
        showMessage('Please select a valid image file (JPEG, PNG, WebP, or GIF)', 'error');
        return;
    }
    
    // Check file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
        showMessage('Image file is too large. Please select an image under 10MB.', 'error');
        return;
    }
    
    try {
        loadingOverlay.classList.add('active');
        
        console.log('Starting image upload...', file.name, file.type, file.size);
        
        // Resize image automatically
        const resizedFile = await resizeImage(file);
        console.log('Image resized:', resizedFile.name, resizedFile.size);
        
        // Get presigned URL
        const token = localStorage.getItem('AUTH_TOKEN');
        const presignRes = await fetch(`${API_BASE}/api/media/presign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                filename: resizedFile.name,
                contentType: resizedFile.type,
                folder: 'profiles'
            })
        });
        
        if (!presignRes.ok) {
            const errorData = await presignRes.json();
            throw new Error(errorData.message || 'Failed to get upload URL');
        }
        
        const presignData = await presignRes.json();
        console.log('Got presigned URL:', presignData.uploadUrl);
        
        // Build full upload URL (handle both absolute and relative URLs)
        const uploadUrl = presignData.uploadUrl.startsWith('http') 
            ? presignData.uploadUrl 
            : `${API_BASE}${presignData.uploadUrl}`;
        
        console.log('Full upload URL:', uploadUrl);
        
        // Upload file
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 
                'Content-Type': resizedFile.type,
                'Authorization': `Bearer ${token}`
            },
            body: resizedFile
        });
        
        if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error('Upload failed:', uploadRes.status, errorText);
            throw new Error(`Upload failed with status ${uploadRes.status}`);
        }
        
        console.log('Upload successful!');
        
        // Update preview
        uploadedImageUrl = presignData.publicUrl;
        profileImagePreview.src = uploadedImageUrl;
        profileImagePreview.style.display = 'block';
        profileImagePlaceholder.style.display = 'none';
        
        showMessage('Image uploaded and resized successfully!', 'success');
    } catch (err) {
        console.error('Upload error:', err);
        showMessage('Failed to upload image: ' + err.message, 'error');
        // Reset file input
        profileImageInput.value = '';
    } finally {
        loadingOverlay.classList.remove('active');
    }
});

// Get checked values
function getCheckedValues(name) {
    return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const languages = getCheckedValues('languages');
    const specializations = getCheckedValues('specializations');
    
    // Validate required fields
    if (!form.shortIntro.value.trim()) {
        showMessage('Short introduction is required', 'error');
        return;
    }
    
    if (!form.bio.value.trim()) {
        showMessage('Biography is required', 'error');
        return;
    }
    
    if (!form.yearsOfExperience.value) {
        showMessage('Years of experience is required', 'error');
        return;
    }
    
    const payload = {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        phone: form.phone.value.trim(),
        country: form.country.value,
        city: form.city.value.trim(),
        shortIntro: form.shortIntro.value.trim(),
        bio: form.bio.value.trim(),
        companyName: form.companyName.value.trim(),
        businessType: form.businessType.value,
        yearsOfExperience: parseInt(form.yearsOfExperience.value),
        languages,
        specializations,
        profileImage: uploadedImageUrl
    };
    
    try {
        const token = localStorage.getItem('AUTH_TOKEN');
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (!data.ok) throw new Error(data.message || 'Failed to update profile');
        
        showMessage('Profile updated successfully! Your changes will appear on the homepage.', 'success');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = './guide-dashboard.html';
        }, 2000);
    } catch (err) {
        console.error('Update error:', err);
        showMessage('Failed to update profile: ' + err.message, 'error');
    }
});

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);
    }
}

// Initialize
loadProfile();

const fs = require("fs");
const path = require("path");

// If AWS vars are present we'll keep S3 behaviour. Otherwise fall back to local storage.
const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET;

if (REGION && BUCKET) {
    // lazy require to avoid pulling aws-sdk when not needed
    const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
    const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

    const s3 = new S3Client({ region: REGION });

    function publicUrlForKey(key) {
        const cf = process.env.CLOUDFRONT_DOMAIN;
        if (cf) return `https://${cf}/${key}`;
        return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    }

    async function getUploadUrl({ key, contentType }) {
        const cmd = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType || "application/octet-stream",
        });
        const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 }); // 60 seconds
        return { uploadUrl, publicUrl: publicUrlForKey(key), key };
    }

    async function deleteKey(key) {
        const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
        await s3.send(cmd);
        return { ok: true };
    }

    module.exports = { getUploadUrl, deleteKey, publicUrlForKey };

} else {
    // Local filesystem fallback
    const uploadsDir = path.join(__dirname, "..", "uploads");
    function publicUrlForKey(key) {
        const port = process.env.PORT || 5000;
        const host = process.env.APP_ORIGIN || `http://localhost:${port}`;
        return `${host}/uploads/${key}`;
    }

    async function getUploadUrl({ key /*, contentType*/ }) {
        // For local mode we provide an upload URL that hits the backend upload handler.
        // Client should PUT the file to this URL.
        const uploadUrl = `/api/media/upload?key=${encodeURIComponent(key)}`;
        return { uploadUrl, publicUrl: publicUrlForKey(key), key };
    }

    async function deleteKey(key) {
        const filePath = path.join(uploadsDir, key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return { ok: true };
        }
        return { ok: false, message: "file not found" };
    }

    module.exports = { getUploadUrl, deleteKey, publicUrlForKey };
}

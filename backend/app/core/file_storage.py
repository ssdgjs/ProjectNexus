import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional

# Allowed file types
ALLOWED_EXTENSIONS = {
    'zip', 'md', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'txt'
}

# File size limit: 30MB
MAX_FILE_SIZE = 30 * 1024 * 1024

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent.parent / 'uploads'

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''


def is_allowed_file(filename: str) -> bool:
    """Check if file type is allowed"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_EXTENSIONS


def validate_file_size(file_size: int) -> None:
    """Validate file size"""
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超过限制（最大 {MAX_FILE_SIZE // (1024*1024)}MB）"
        )


def validate_file_type(filename: str) -> None:
    """Validate file type"""
    if not is_allowed_file(filename):
        allowed = ', '.join(ALLOWED_EXTENSIONS)
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型。允许的类型：{allowed}"
        )


async def save_upload_file(
    upload_file: UploadFile,
    user_id: int
) -> tuple[str, int]:
    """
    Save uploaded file to disk

    Returns:
        tuple: (file_path, file_size)
    """
    # Validate file type
    validate_file_type(upload_file.filename or "unknown")

    # Read file content to validate size
    content = await upload_file.read()

    # Validate file size
    validate_file_size(len(content))

    # Generate unique filename
    ext = get_file_extension(upload_file.filename or "unknown")
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    with open(file_path, 'wb') as f:
        f.write(content)

    return str(file_path), len(content)


def delete_file(file_path: str) -> bool:
    """
    Delete file from disk

    Returns:
        bool: True if deleted successfully, False otherwise
    """
    try:
        path = Path(file_path)
        if path.exists() and path.is_file():
            path.unlink()
            return True
        return False
    except Exception:
        return False


def format_file_size(size_bytes: int) -> str:
    """Format file size for display"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

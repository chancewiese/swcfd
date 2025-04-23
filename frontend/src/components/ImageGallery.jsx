// src/components/ImageGallery.jsx
import { useState } from "react";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import ImageUpload from "./ImageUpload";

// Material UI imports
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

function ImageGallery({ eventSlug, images, onDeleteImage, onImageUploaded }) {
  const [viewImage, setViewImage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleOpenImage = (image) => {
    setViewImage(image);
  };

  const handleCloseImage = () => {
    setViewImage(null);
  };

  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setImageToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete || !imageToDelete._id) return;

    setDeleting(true);
    setError("");

    try {
      await onDeleteImage(imageToDelete._id);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete image");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      {/* Image Upload Component */}
      <ImageUpload eventSlug={eventSlug} onImageUploaded={onImageUploaded} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Image Gallery Grid */}
      <Grid container spacing={2}>
        {images && images.length > 0 ? (
          images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={image._id || index}>
              <Card sx={{ height: "100%" }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={getImageUrl(image.imageUrl)}
                  alt={image.name}
                  sx={{ objectFit: "cover", cursor: "pointer" }}
                  onClick={() => handleOpenImage(image)}
                  onError={handleImageError}
                />
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="body2" noWrap>
                    {image.name}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenImage(image)}
                    aria-label="View Image"
                  >
                    <ZoomInIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(image)}
                    aria-label="Delete Image"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                border: "1px dashed #ccc",
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                No images in gallery. Upload your first image above.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewImage} onClose={handleCloseImage} maxWidth="md">
        {viewImage && (
          <>
            <DialogTitle>{viewImage.name}</DialogTitle>
            <DialogContent>
              <Box
                sx={{ position: "relative", width: "100%", maxHeight: "70vh" }}
              >
                <img
                  src={getImageUrl(viewImage.imageUrl)}
                  alt={viewImage.name}
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                  }}
                  onError={handleImageError}
                />
                {/* Image path for debugging */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2, display: "block" }}
                >
                  Image path: {viewImage.imageUrl}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseImage}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Image</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the image "{imageToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ImageGallery;

// src/components/events/EventGallery.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
   Box,
   ImageList,
   ImageListItem,
   IconButton,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Button,
   TextField,
   Typography,
   Alert,
} from "@mui/material";
import {
   Delete as DeleteIcon,
   Add as AddIcon,
   ArrowUpward as ArrowUpIcon,
   ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material";

const EventGallery = ({
   eventId,
   images = [],
   onUpload,
   onDelete,
   onReorder,
}) => {
   const { user } = useAuth();
   const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
   const [selectedFile, setSelectedFile] = useState(null);
   const [caption, setCaption] = useState("");
   const [error, setError] = useState("");

   const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
         setSelectedFile(file);
         setError("");
      } else {
         setError("Please select a valid image file");
      }
   };

   const handleUpload = async () => {
      if (!selectedFile) {
         setError("Please select a file");
         return;
      }

      try {
         const formData = new FormData();
         formData.append("image", selectedFile);
         formData.append("caption", caption);

         await onUpload(formData);
         setUploadDialogOpen(false);
         setSelectedFile(null);
         setCaption("");
         setError("");
      } catch (error) {
         setError("Failed to upload image");
      }
   };

   const handleMoveImage = (imageId, direction) => {
      const currentIndex = images.findIndex((img) => img.id === imageId);
      if (
         (direction === "up" && currentIndex === 0) ||
         (direction === "down" && currentIndex === images.length - 1)
      ) {
         return;
      }

      const newImages = [...images];
      const swap = direction === "up" ? -1 : 1;
      [newImages[currentIndex], newImages[currentIndex + swap]] = [
         newImages[currentIndex + swap],
         newImages[currentIndex],
      ];

      onReorder(newImages.map((img) => img.id));
   };

   if (!images.length && !user?.isAdmin) {
      return (
         <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
               No photos available yet
            </Typography>
         </Box>
      );
   }

   return (
      <Box>
         {user?.isAdmin && (
            <Button
               startIcon={<AddIcon />}
               onClick={() => setUploadDialogOpen(true)}
               variant="contained"
               sx={{ mb: 2 }}
            >
               Add Photo
            </Button>
         )}

         <ImageList cols={3} gap={8}>
            {images.map((image) => (
               <ImageListItem key={image.id} sx={{ position: "relative" }}>
                  <img
                     src={`http://localhost:3000${image.url}`}
                     alt={image.caption || "Event photo"}
                     loading="lazy"
                     style={{ height: "200px", objectFit: "cover" }}
                  />
                  {image.caption && (
                     <Typography
                        variant="caption"
                        sx={{
                           position: "absolute",
                           bottom: 0,
                           left: 0,
                           right: 0,
                           bgcolor: "rgba(0,0,0,0.6)",
                           color: "white",
                           p: 1,
                        }}
                     >
                        {image.caption}
                     </Typography>
                  )}
                  {user?.isAdmin && (
                     <Box
                        sx={{
                           position: "absolute",
                           top: 0,
                           right: 0,
                           bgcolor: "rgba(0,0,0,0.6)",
                           display: "flex",
                        }}
                     >
                        <IconButton
                           size="small"
                           onClick={() => handleMoveImage(image.id, "up")}
                           disabled={images.indexOf(image) === 0}
                           sx={{ color: "white" }}
                        >
                           <ArrowUpIcon />
                        </IconButton>
                        <IconButton
                           size="small"
                           onClick={() => handleMoveImage(image.id, "down")}
                           disabled={
                              images.indexOf(image) === images.length - 1
                           }
                           sx={{ color: "white" }}
                        >
                           <ArrowDownIcon />
                        </IconButton>
                        <IconButton
                           size="small"
                           onClick={() => onDelete(image.id)}
                           sx={{ color: "white" }}
                        >
                           <DeleteIcon />
                        </IconButton>
                     </Box>
                  )}
               </ImageListItem>
            ))}
         </ImageList>

         <Dialog
            open={uploadDialogOpen}
            onClose={() => setUploadDialogOpen(false)}
         >
            <DialogTitle>Add New Photo</DialogTitle>
            <DialogContent>
               {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                     {error}
                  </Alert>
               )}
               <Box sx={{ my: 2 }}>
                  <input
                     accept="image/*"
                     type="file"
                     onChange={handleFileSelect}
                     style={{ marginBottom: "1rem", display: "block" }}
                  />
                  <TextField
                     label="Caption (optional)"
                     fullWidth
                     value={caption}
                     onChange={(e) => setCaption(e.target.value)}
                     sx={{ mt: 2 }}
                  />
               </Box>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setUploadDialogOpen(false)}>
                  Cancel
               </Button>
               <Button onClick={handleUpload} variant="contained">
                  Upload
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
};

export default EventGallery;

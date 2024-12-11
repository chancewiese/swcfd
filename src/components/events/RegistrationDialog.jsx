// src/components/events/RegistrationDialog.jsx
import { useState, useEffect } from "react";
import {
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Button,
   Grid,
   TextField,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
} from "@mui/material";
import { format, parseISO } from "date-fns";

const defaultFormData = {
   players: ["", ""],
   email: "",
   phone: "",
   segmentId: "",
};

const RegistrationDialog = ({
   open,
   onClose,
   onSubmit,
   segments,
   initialData = null,
   isEdit = false,
}) => {
   const [formData, setFormData] = useState(defaultFormData);

   useEffect(() => {
      if (open) {
         setFormData(initialData || defaultFormData);
      }
   }, [initialData, open]);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name.startsWith("player")) {
         const index = parseInt(name.slice(-1)) - 1;
         const newPlayers = [...formData.players];
         newPlayers[index] = value;
         setFormData((prev) => ({
            ...prev,
            players: newPlayers,
         }));
      } else {
         setFormData((prev) => ({
            ...prev,
            [name]: value,
         }));
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      onClose();
   };

   return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
         <DialogTitle>
            {isEdit ? "Edit Registration" : "Team Registration"}
         </DialogTitle>
         <form onSubmit={handleSubmit}>
            <DialogContent>
               <Grid container spacing={2}>
                  <Grid item xs={12}>
                     <FormControl fullWidth required variant="outlined">
                        <InputLabel id="division-label">Division</InputLabel>
                        <Select
                           labelId="division-label"
                           name="segmentId"
                           value={formData?.segmentId || ""}
                           onChange={handleInputChange}
                           label="Division"
                        >
                           {segments.map((segment) => (
                              <MenuItem key={segment.id} value={segment.id}>
                                 {segment.title}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                     <TextField
                        fullWidth
                        label="Player 1 Name"
                        name="player1"
                        value={formData?.players?.[0] || ""}
                        onChange={handleInputChange}
                        required
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <TextField
                        fullWidth
                        label="Player 2 Name"
                        name="player2"
                        value={formData?.players?.[1] || ""}
                        onChange={handleInputChange}
                        required
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        name="email"
                        value={formData?.email || ""}
                        onChange={handleInputChange}
                        required
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData?.phone || ""}
                        onChange={handleInputChange}
                        required
                     />
                  </Grid>
               </Grid>
            </DialogContent>
            <DialogActions>
               <Button onClick={onClose}>Cancel</Button>
               <Button type="submit" variant="contained">
                  {isEdit ? "Save Changes" : "Register Team"}
               </Button>
            </DialogActions>
         </form>
      </Dialog>
   );
};

export default RegistrationDialog;

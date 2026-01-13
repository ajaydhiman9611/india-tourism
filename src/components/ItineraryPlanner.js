import React, { useRef, useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Autocomplete, // <-- Import Autocomplete
  CircularProgress
} from '@mui/material';
import DOMPurify from 'dompurify';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import apicalls from '../helpers/apicalls';
// Sample data (indianStates and months remain the same)
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
].sort();

const tripType = ['Backpacking', 'Honeymoon', 'Roadtrip', 'Leisure/Vacation', 'Office Team Outing', 'Business' , 'Adventure', 'Cultural', 'Family Getaway', 'Spa & Wellness', 'Nature & Wildlife'].sort();

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Custom theme (remains the same)
const theme = createTheme({
  palette: {
    // primary: {
    //   main: '#ff9933',
    //   contrastText: '#fff',
    // },
    secondary: {
      main: '#138808',
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
    }
  }
});

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText || '#fff',
  '& .MuiCardHeader-title': {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
}));


function ItineraryPlanner() {
  const [formData, setFormData] = useState({
    selectedStates: [], // This will now be an array of strings from Autocomplete
    daysOfItinerary: 3,
    monthOfVisit: months[0],
    compulsoryPlace: '',
    reachingPoint: '',
    departingPoint: '',
    otherInfo: '',
    tripType: ''
  });
  const [loading, setLoading] = useState(false);
  const [itineraryDetails, setItineraryDetails] = useState('');

  const itineraryDisplayRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "daysOfItinerary") {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >=1 && numValue <=90) {
            setFormData(prev => ({ ...prev, [name]: numValue }));
        } else if (value === "") {
            setFormData(prev => ({ ...prev, [name]: '' }));
        }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Specific handler for Autocomplete's multiple selection
  const handleStatesChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      selectedStates: newValue
    }));
  };

  const handleTripTypeChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      tripType: newValue
    }));
  };

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    if (formData.selectedStates.length === 0) {
        alert("Please select at least one state to visit.");
        setLoading(false)
        return;
    }
    if (!formData.daysOfItinerary || formData.daysOfItinerary < 1) {
        alert("Please enter a valid number of days (minimum 1).");
        setLoading(false)
        return;
    }
    console.log("Form Submitted:", formData);
    // setSubmittedData(formData);

    if (formData) {
      apicalls.apiHelper({url: '/g_prmpt/test', method: 'POST', data: { promptBody: formData} })
      .then(response => {
        console.log("API Response:", response);
        setItineraryDetails(response.data);
      })
      .catch(error => {console.log(error)})
      .finally(data => setLoading(false));
      // setTimeout(() => {
      //   alert("Trip Planner Details Submitted Successfully!");
      //   setSubmittedData(null);
      // }, 2000);
    }
  };

  const createMarkup = (htmlString) => {
    if (!htmlString) {
      return { __html: '' };
    }

    let pureHtml = htmlString
      .replace(/^```html\s*\n/i, '')
      .replace(/\n\s*```$/, '');

    // Trim any leading/trailing whitespace that might be left
    pureHtml = pureHtml.trim();

    // 2. Sanitize the HTML
    const cleanHtml = DOMPurify.sanitize(pureHtml);

    return { __html: cleanHtml };
  };

  // const submitTripPlannerDetails = () => {
  // }

  useEffect(() => {
    if (itineraryDetails && itineraryDisplayRef.current) {
      itineraryDisplayRef.current.scrollIntoView({
        behavior: 'smooth', // Enables smooth scrolling
        block: 'start',    // Aligns the top of the element to the top of the visible area
      });
      // Optional: Add a class for a subtle fade-in or slide-in animation
      itineraryDisplayRef.current.classList.add('fade-in-scroll');
      // Remove the class after animation to allow re-triggering if needed (or manage with state)
      const timer = setTimeout(() => {
        if (itineraryDisplayRef.current) { // Check if ref still exists
            itineraryDisplayRef.current.classList.remove('fade-in-scroll');
        }
      }, 1000); // Match animation duration

      return () => clearTimeout(timer); // Cleanup timer on unmount or if effect re-runs
    }
  }, [itineraryDetails]);

  return (
    <ThemeProvider theme={theme}>
      <Container sx={{ mt: 4, mb: 5 }}>
        <StyledCard>
          <StyledCardHeader title="Plan Your Indian Adventure!" />
          <CardContent sx={{
              overflowY: "auto", 
              flexGrow: 1,
                
            }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={1}>
                <Grid item size={12}>
                  <Autocomplete
                    multiple
                    id="states-autocomplete"
                    options={indianStates}
                    value={formData.selectedStates}
                    onChange={handleStatesChange}
                    getOptionLabel={(option) => option} // Since options are strings
                    isOptionEqualToValue={(option, value) => option === value} // For proper comparison
                    // disableCloseOnSelect // Keeps the dropdown open after selection
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="State(s) to Visit"
                        placeholder="Type or select states"
                        margin="normal"
                        required={formData.selectedStates.length === 0} // Dynamic required
                        helperText="Select one or more states you wish to explore."
                        error={(formData.selectedStates.length === 0 || formData.selectedStates.length > 2)} // Show error after first submit attempt
                      />
                    )}
                  />
                </Grid>

                <Grid item size={3}>
                  <TextField
                    label="Days of Itinerary"
                    type="number"
                    name="daysOfItinerary"
                    value={formData.daysOfItinerary}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required
                    InputProps={{ inputProps: { min: 1, max: 90 } }}
                    helperText="Enter total days for your trip (1-90)."
                  />
                </Grid>
                <Grid item size={3}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel id="month-of-visit-label">Month of Visit</InputLabel>
                    <Select
                      labelId="month-of-visit-label"
                      id="monthOfVisit"
                      name="monthOfVisit"
                      value={formData.monthOfVisit}
                      label="Month of Visit"
                      onChange={handleInputChange}
                    >
                      {months.map(month => (
                        <MenuItem key={month} value={month}>{month}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item size={6}>
                  {/* --- MUI Autocomplete for States --- */}
                  <Autocomplete
                    // multiple
                    id="tripType"
                    options={tripType}
                    value={formData.tripType}
                    onChange={handleTripTypeChange}
                    getOptionLabel={(option) => option} // Since options are strings
                    isOptionEqualToValue={(option, value) => option === value} // For proper comparison
                    // disableCloseOnSelect // Keeps the dropdown open after selection
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="What kind of trip are you planning for?"
                        placeholder="Select trip type"
                        margin="normal"
                        required={formData.tripType.length === 0} // Dynamic required
                        // helperText="Select one or more states you wish to explore."
                        // error={(formData.tripType.length === 0 || formData.tripType.length > 2) && submittedData !== null} // Show error after first submit attempt
                      />
                    )}
                  />
                </Grid>

                <Grid item size={12}>
                  <TextField
                    label="Specific Destination(s) to Visit (if any)"
                    name="compulsoryPlace"
                    value={formData.compulsoryPlace}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    placeholder="e.g., Taj Mahal, Golden Temple, etc"
                    helperText="List any specific attractions or cities you must visit in a comma-separated list."
                  />
                </Grid>


                <Grid item size={6}>
                  <TextField
                    label="Reaching Station/Airport/Bus Stand"
                    name="reachingPoint"
                    value={formData.reachingPoint}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    placeholder="e.g., Indira Gandhi International Airport, Delhi (DEL)"
                  />
                </Grid>
                <Grid item size={6}>
                  <TextField
                    label="Departing Station/Airport/Bus Stand"
                    name="departingPoint"
                    value={formData.departingPoint}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    placeholder="e.g., Chhatrapati Shivaji Maharaj International Airport, Mumbai (BOM)"
                  />
                </Grid>

                <Grid item size={12}>
                  <TextField
                    label="Any Other Information or Preferences"
                    name="otherInfo"
                    value={formData.otherInfo}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    placeholder="e.g., Prefer budget travel, interested in wildlife, ..."
                  />
                </Grid>

                <Grid item size={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }}
                    loading={loading}
                    loadingIndicator="Loading…"
                  >
                    Plan my trip please
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <br/><br/>
            {itineraryDetails && !loading && (
              <div 
                className="itinerary-content-display" 
                style={{ 
                  marginTop: '20px',
                  padding: '15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  background: '#f9f9f9'
                  }}>
                <h3>Generated Itinerary:</h3>
                <div dangerouslySetInnerHTML={createMarkup(itineraryDetails)} />
              </div>
            )}
          </CardContent>
        </StyledCard>
      </Container>
    </ThemeProvider>
  );
}

export default ItineraryPlanner;
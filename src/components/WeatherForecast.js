import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { WbSunny, Cloud, Opacity, AcUnit, Thunderstorm, Air } from '@mui/icons-material';
import axios from 'axios';

const WeatherForecast = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return;

      setLoading(true);
      setError(null);

      try {
        // Call our backend API to get weather data
        const response = await axios.get(`/api/weather?location=${encodeURIComponent(location)}`);

        // Map the API response to our weather object
        const weatherData = {
          temperature: response.data.temperature,
          condition: mapCondition(response.data.condition), // Map Open-Meteo condition to our condition
          description: response.data.description,
          humidity: response.data.humidity,
          windSpeed: response.data.windSpeed,
          temperatureUnit: response.data.temperatureUnit,
          icon: response.data.icon,
        };

        setWeather(weatherData);
        setLoading(false);
      } catch (err) {
        console.error('Weather API error:', err);

        // Provide more specific error messages based on the error
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (err.response.status === 404) {
            setError(`Location "${location}" not found. Please check the spelling.`);
          } else if (err.response.status === 401) {
            setError('Weather API key is invalid or missing. Please contact an administrator.');
          } else {
            setError(err.response.data?.detail || `Error: ${err.response.status}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response from weather service. Please try again later.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('Failed to fetch weather data: ' + err.message);
        }

        setLoading(false);
      }
    };

    // Map Open-Meteo conditions to our condition categories
    const mapCondition = (condition) => {
      const conditionMap = {
        'Clear': 'Sunny',
        'Clouds': 'Cloudy',
        'Rain': 'Rainy',
        'Drizzle': 'Rainy',
        'Thunderstorm': 'Stormy',
        'Snow': 'Snowy',
        'Mist': 'Cloudy',
        'Smoke': 'Cloudy',
        'Haze': 'Cloudy',
        'Dust': 'Cloudy',
        'Fog': 'Cloudy',
        'Sand': 'Cloudy',
        'Ash': 'Cloudy',
        'Squall': 'Windy',
        'Tornado': 'Stormy',
      };

      return conditionMap[condition] || 'Sunny'; // Default to Sunny if condition not found
    };

    fetchWeather();
  }, [location]);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Sunny':
        return <WbSunny sx={{ color: '#FFD700', fontSize: 40 }} />;
      case 'Cloudy':
        return <Cloud sx={{ color: '#A9A9A9', fontSize: 40 }} />;
      case 'Rainy':
        return <Opacity sx={{ color: '#4682B4', fontSize: 40 }} />;
      case 'Snowy':
        return <AcUnit sx={{ color: '#E0FFFF', fontSize: 40 }} />;
      case 'Stormy':
        return <Thunderstorm sx={{ color: '#483D8B', fontSize: 40 }} />;
      case 'Windy':
        return <Air sx={{ color: '#B0C4DE', fontSize: 40 }} />;
      default:
        return <WbSunny sx={{ color: '#FFD700', fontSize: 40 }} />;
    }
  };

  if (!location) {
    return (
      <Box sx={{ textAlign: 'center', color: 'white' }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          No location set. Please update your profile.
        </Typography>
        <Button 
          variant="outlined" 
          color="inherit" 
          size="small"
          href="/profile"
          sx={{ 
            borderColor: 'rgba(255,255,255,0.5)', 
            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
          }}
        >
          Go to Profile
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
        <Typography>Loading weather data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', color: 'white' }}>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // Function to convert Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius) => {
    return Math.round((celsius * 9/5) + 32);
  };

  if (!weather) return null;

  // Convert temperature to Fahrenheit
  const tempInFahrenheit = celsiusToFahrenheit(weather.temperature);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
      <Box sx={{ mr: 3 }}>
        {getWeatherIcon(weather.condition)}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight="medium">
          {tempInFahrenheit}°F
        </Typography>
        <Typography variant="body2">
          {weather.condition} in {location}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Humidity: {weather.humidity}% | Wind: {weather.windSpeed} km/h
        </Typography>
      </Box>
    </Box>
  );
};

export default WeatherForecast;

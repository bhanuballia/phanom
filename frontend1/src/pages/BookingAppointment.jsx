import React from 'react';
import Navigation from '../components/Navigation';
import BookAppointment from '../components/BookAppointment';

const BookingAppointment = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Main Content - BookAppointment Component */}
      <div className="relative z-10 pt-20">
        <BookAppointment />
      </div>
    </div>
  );
};

export default BookingAppointment;
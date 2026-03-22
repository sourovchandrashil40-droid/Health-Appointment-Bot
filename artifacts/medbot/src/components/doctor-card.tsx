import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Building2, Stethoscope, Banknote, CalendarCheck } from 'lucide-react';
import { Doctor } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from './booking-modal';

interface DoctorCardProps {
  doctor: Doctor;
  onBookingSuccess: () => void;
}

export function DoctorCard({ doctor, onBookingSuccess }: DoctorCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 w-[300px] sm:w-[340px] bg-card rounded-2xl p-5 shadow-lg shadow-black/5 border border-border/50 flex flex-col gap-4 snap-start hover:shadow-xl hover:border-primary/20 transition-all duration-300"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
            <span className="text-xl font-display font-bold text-primary">
              {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-tight line-clamp-1" title={doctor.name}>
              {doctor.name}
            </h3>
            <p className="text-sm text-primary font-medium mt-0.5">{doctor.specialty}</p>
            <div className="flex items-center gap-1 mt-1.5 bg-amber-100/50 text-amber-700 w-fit px-1.5 py-0.5 rounded text-xs font-semibold">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{doctor.rating.toFixed(1)}</span>
              <span className="text-amber-700/60 ml-0.5 font-normal">({doctor.experience}y exp)</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground flex-grow">
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
            <span className="line-clamp-1">{doctor.hospital}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
            <span>{doctor.city}</span>
          </div>
          <div className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
            <span className="line-clamp-1">{doctor.qualification}</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-primary/70 shrink-0" />
            <span className="font-medium text-foreground">৳{doctor.consultationFee} <span className="text-muted-foreground font-normal">/ visit</span></span>
          </div>
        </div>

        <Button 
          className="w-full mt-2 font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md shadow-primary/20 transition-all rounded-xl"
          onClick={() => setIsModalOpen(true)}
        >
          <CalendarCheck className="w-4 h-4 mr-2" />
          View Slots & Book
        </Button>
      </motion.div>

      <BookingModal 
        doctor={doctor} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={onBookingSuccess}
      />
    </>
  );
}

import React from 'react';
import { format, parseISO } from 'date-fns';
import { useListAppointments } from '@workspace/api-client-react';
import { Calendar, Clock, MapPin, Building2, Activity, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AppointmentsPanel() {
  const { data: appointments, isLoading } = useListAppointments();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <img 
          src={`${import.meta.env.BASE_URL}images/empty-appointments.png`} 
          alt="No appointments" 
          className="w-48 h-48 object-contain opacity-80 mb-6 drop-shadow-xl"
        />
        <h3 className="text-lg font-bold text-foreground mb-2 font-display">No Appointments Yet</h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Your booked doctor appointments will appear here. Chat with MedBot to book one!
        </p>
      </div>
    );
  }

  // Sort by date (newest first for simplicity, ideally nearest future date)
  const sorted = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full scrollbar-thin pb-24">
      <h2 className="font-display font-bold text-xl text-foreground px-1">Upcoming Visits</h2>
      
      {sorted.map(apt => {
        const isPast = new Date(apt.date) < new Date(new Date().setHours(0,0,0,0));
        
        return (
          <div 
            key={apt.id} 
            className={`
              bg-card rounded-2xl p-5 border shadow-sm transition-all
              ${isPast ? 'border-border/50 opacity-75' : 'border-primary/20 shadow-primary/5 hover:shadow-md'}
            `}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-foreground text-lg">{apt.doctorName}</h4>
                <p className="text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full mt-1">
                  {apt.specialty}
                </p>
              </div>
              <Badge variant={isPast ? "secondary" : "default"} className={isPast ? "" : "bg-accent/10 text-accent border-accent/20"}>
                {isPast ? "Completed" : "Confirmed"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{format(parseISO(apt.date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{apt.time}</span>
              </div>
              
              <div className="flex items-center gap-2 col-span-2">
                <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="truncate">{apt.hospitalName}, {apt.city}</span>
              </div>

              <div className="flex items-center gap-2 col-span-2">
                <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="truncate">Patient: {apt.patientName}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

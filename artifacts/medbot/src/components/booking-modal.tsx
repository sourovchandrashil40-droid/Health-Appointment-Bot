import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Doctor, TimeSlot, useGetDoctorAvailability, useCreateAppointment } from '@workspace/api-client-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BookingModalProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ doctor, isOpen, onClose, onSuccess }: BookingModalProps) {
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  const { data: slots, isLoading: isSlotsLoading } = useGetDoctorAvailability(doctor.id, {
    query: { enabled: isOpen }
  });

  const { mutate: bookAppointment, isPending: isBooking } = useCreateAppointment({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Appointment Confirmed! 🎉",
          description: `Your appointment with ${doctor.name} has been booked successfully.`,
        });
        onSuccess();
        onClose();
        // Reset form
        setSelectedSlot(null);
        setPatientName('');
        setPatientPhone('');
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: err.message || "Failed to book appointment. Please try again.",
        });
      }
    }
  });

  const handleBook = () => {
    if (!selectedSlot) return;
    if (!patientName.trim() || !patientPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter patient name and phone number.",
      });
      return;
    }

    bookAppointment({
      data: {
        doctorId: doctor.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        date: selectedSlot.date,
        time: selectedSlot.time
      }
    });
  };

  // Group slots by date
  const groupedSlots = slots?.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>) || {};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background rounded-3xl border-border/50">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-6 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Book Appointment
            </DialogTitle>
            <DialogDescription className="text-foreground/80 mt-1">
              Select a time slot for <span className="font-semibold text-primary">{doctor.name}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-thin">
          {isSlotsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Checking availability...</p>
            </div>
          ) : slots?.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No available slots found for this doctor.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([date, daySlots]) => (
                <div key={date} className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map(slot => (
                      <Badge
                        key={slot.id}
                        variant={slot.available ? (selectedSlot?.id === slot.id ? "default" : "outline") : "secondary"}
                        className={`
                          px-4 py-2 text-sm cursor-pointer transition-all duration-200
                          ${!slot.available ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
                          ${selectedSlot?.id === slot.id ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-background'}
                        `}
                        onClick={() => slot.available && setSelectedSlot(slot)}
                      >
                        <Clock className="w-3 h-3 mr-1.5 inline" />
                        {slot.time}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              {selectedSlot && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 border-t border-border space-y-4"
                >
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Selected Slot</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(selectedSlot.date), 'MMM d, yyyy')} at {selectedSlot.time}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Patient Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        className="rounded-xl border-border/50 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="01XXXXXXXXX" 
                        value={patientPhone}
                        onChange={e => setPatientPhone(e.target.value)}
                        className="rounded-xl border-border/50 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50 bg-muted/30">
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button 
              onClick={handleBook} 
              disabled={!selectedSlot || isBooking}
              className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 min-w-[140px]"
            >
              {isBooking ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

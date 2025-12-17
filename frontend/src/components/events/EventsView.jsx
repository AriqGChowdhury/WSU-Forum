import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/services/api';
import { formatEventDateTime } from '@/lib/utils';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Loader2,
  CalendarPlus,
  Star
} from 'lucide-react';

export function EventsView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    api.events.getAll()
      .then(({ events }) => setEvents(events))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRSVP = async (eventId, status) => {
    const currentStatus = rsvpStatus[eventId];
    
    // Toggle off if same status
    const newStatus = currentStatus === status ? null : status;
    
    setRsvpStatus((prev) => ({ ...prev, [eventId]: newStatus }));

    try {
      await api.events.rsvp(eventId, newStatus || 'none');
    } catch {
      setRsvpStatus((prev) => ({ ...prev, [eventId]: currentStatus }));
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);
  const pastEvents = events.filter((e) => new Date(e.date) < now);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--wsu-green)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-zinc-500">Discover what's happening on campus</p>
        </div>
        <Button className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90">
          <CalendarPlus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                <h3 className="font-semibold mb-1">No upcoming events</h3>
                <p className="text-zinc-500 text-sm">
                  Check back later or create your own event
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                rsvpStatus={rsvpStatus[event.id]}
                onRSVP={(status) => handleRSVP(event.id, status)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                <h3 className="font-semibold mb-1">No past events</h3>
                <p className="text-zinc-500 text-sm">
                  Events you've attended will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            pastEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                isPast 
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventCard({ event, rsvpStatus, onRSVP, isPast }) {
  const dateObj = new Date(event.date);
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const day = dateObj.getDate();

  return (
    <Card className={`hover:shadow-md transition ${isPast ? 'opacity-60' : ''}`}>
      <CardContent className="p-0">
        <div className="flex">
          {/* Date Badge */}
          <div className="flex-shrink-0 w-20 bg-[var(--wsu-green)] text-white flex flex-col items-center justify-center rounded-l-lg">
            <span className="text-xs uppercase">{month}</span>
            <span className="text-2xl font-bold">{day}</span>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-zinc-600 line-clamp-2">
                    {event.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-sm text-zinc-500 pt-1">
                  {event.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </span>
                  )}
                  {event.place && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.place}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {event.going} going
                  </span>
                </div>
              </div>

              {/* RSVP Buttons */}
              {!isPast && onRSVP && (
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                    onClick={() => onRSVP('going')}
                    className={rsvpStatus === 'going' ? 'bg-[var(--wsu-green)]' : ''}
                  >
                    Going
                  </Button>
                  <Button
                    size="sm"
                    variant={rsvpStatus === 'interested' ? 'default' : 'outline'}
                    onClick={() => onRSVP('interested')}
                    className={rsvpStatus === 'interested' ? 'bg-amber-500' : ''}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Interested
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EventsView;

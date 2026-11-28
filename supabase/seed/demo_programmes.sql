-- DEMO programmes taken from the original static website's placeholder timetable.
-- They are NOT confirmed Angel 96.1 FM programming. Use them to see the timetable
-- working, then edit or delete them in Admin -> Programmes and enter the real shows.
--
-- Run once in the Supabase SQL Editor. Safe to run again (existing slugs are skipped).
-- Presenters are not linked: add real presenters in the admin, then edit each programme.

insert into public.programmes (slug, title, description, days, start_time, end_time, is_active) values
  ('angel-wake-up-show',  'Angel Wake-Up Show',  'Start your day with the finest mix of news, traffic, weather and feel-good music.',        array['mon','tue','wed','thu','fri'], '06:00', '09:00', true),
  ('mid-morning-vibes',   'Mid-Morning Vibes',   'Lifestyle chats, relationship talk and the best throwback playlist in town.',              array['mon','tue','wed','thu','fri'], '09:00', '12:00', true),
  ('angel-news-hour',     'Angel News Hour',     'In-depth coverage of the day''s top stories, politics and business headlines.',            array['mon','tue','wed','thu','fri'], '12:00', '15:00', true),
  ('drive-time-live',     'Drive Time Live',     'The perfect soundtrack for your commute: hits, banter and listener call-ins.',             array['mon','tue','wed','thu','fri'], '15:00', '18:00', true),
  ('angel-sports-desk',   'Angel Sports Desk',   'Match analysis, transfer news, and the loudest sports debate on radio.',                   array['mon','tue','wed','thu','fri'], '18:00', '21:00', true),
  ('late-night-grooves',  'Late Night Grooves',  'Smooth, slow, and soulful: the perfect wind-down to your night.',                          array['mon','tue','wed','thu','fri'], '21:00', '00:00', true),
  ('weekend-wake-up',     'Weekend Wake-Up',     'A relaxed start to your weekend with easy listening and light news.',                      array['sat','sun'],                   '06:00', '09:00', true),
  ('family-hour',         'Family Hour',         'Family-friendly discussions, health tips and community spotlights.',                       array['sat','sun'],                   '09:00', '12:00', true),
  ('weekend-jams',        'Weekend Jams',        'Non-stop weekend party mix across every genre you love.',                                  array['sat','sun'],                   '12:00', '15:00', true),
  ('sports-weekend',      'Sports Weekend',      'Full weekend fixtures coverage and live match commentary.',                                array['sat','sun'],                   '15:00', '18:00', true),
  ('the-request-line',    'The Request Line',    'You call, we play: listener requests all evening long.',                                   array['sat','sun'],                   '18:00', '21:00', true),
  ('angel-afterglow',     'Angel Afterglow',     'Chilled-out sounds to close your weekend night.',                                          array['sat','sun'],                   '21:00', '00:00', true)
on conflict (slug) do nothing;

-- To remove exactly these demo programmes later, run:
-- delete from public.programmes where slug in ('angel-wake-up-show','mid-morning-vibes','angel-news-hour','drive-time-live','angel-sports-desk','late-night-grooves','weekend-wake-up','family-hour','weekend-jams','sports-weekend','the-request-line','angel-afterglow');

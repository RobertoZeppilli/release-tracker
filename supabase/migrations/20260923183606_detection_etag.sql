-- The daily Detection asks every detection Source whether anything changed before downloading it:
-- an npm packument is megabytes, and on most days it is the same one as yesterday.
-- Null means "never fetched, or the Source does not offer one": always download.
alter table public.sources add column etag text;

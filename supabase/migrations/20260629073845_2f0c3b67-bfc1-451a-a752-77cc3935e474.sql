-- Enable scheduler + HTTP client extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Remove any previous keep-alive job before recreating
select cron.unschedule('keep-worker-warm')
where exists (select 1 from cron.job where jobname = 'keep-worker-warm');

-- Ping the public health endpoint every 5 minutes to keep the worker warm
select cron.schedule(
  'keep-worker-warm',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://baitunnazat-mosque.lovable.app/api/public/health',
    timeout_milliseconds := 8000
  );
  $$
);
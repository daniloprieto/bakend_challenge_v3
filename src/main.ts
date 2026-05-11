import { env } from './shared/config/env.js';
import { createApp } from './shared/http/create-app.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});

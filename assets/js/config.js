/* Public settings. The Supabase key here is the public (anon / publishable) key:
   it is meant to be in the browser, and the database only lets it insert admission requests. */
window.ALTUZ_CONFIG={
  supabaseUrl:'',        // e.g. https://abcdefgh.supabase.co
  supabaseAnonKey:'',    // Project Settings > API Keys > publishable (or legacy anon) key
  vercelAnalytics:true,  // loads only after "Footfall" consent; switch on Web Analytics in the Vercel project
  metaPixelId:'',        // loads only after "Invitations" consent
  tiktokPixelId:''       // loads only after "Invitations" consent
};

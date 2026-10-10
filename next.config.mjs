export default {
  serverExternalPackages: ['@electric-sql/pglite'],
  redirects: async () => [{ source: '/help/contact/:path*', destination: '/contact', permanent: true }],
}

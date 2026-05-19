
export const metadata = {
  title: 'SeenHub Admin | Secure Dashboard',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }) {
  return <>{children}</>;
}

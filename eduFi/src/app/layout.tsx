import type { Metadata } from "next";

// import { getSession } from "~/auth"
import "~/app/globals.css";
import "@neynar/react/dist/style.css";
import { Providers } from "~/app/providers";
import { APP_NAME, APP_DESCRIPTION } from "~/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: `${APP_NAME} - Challenge Your Knowledge`,
    description: "Test your knowledge with engaging quizzes across various topics",
    images: ["https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=1200"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Challenge Your Knowledge",
    description: "Test your knowledge with engaging quizzes across various topics",
    images: "https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=1200",
    creator: "https://.com/bobman7000",
    site: "https://learna.vercel.app"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
  // const session = await getSession()

  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
# MediQ - Your One-Stop Solution for Medicine Management

MediQ is a comprehensive platform designed to simplify medicine management, store inventory, and provide real-time access to nearby medical facilities. Built with [Next.js](https://nextjs.org), MediQ offers a seamless user experience with modern features like voice search, dynamic maps, and AI-powered insights.

---

## Features

### 🌟 Medicine Information
- Search for medicines and get detailed information, including composition, manufacturer, and usage.
- Compare alternatives and find the best options for your needs.

### 🏪 Store Management
- Manage your medical store inventory, orders, and reminders.
- Add, edit, and track medicines with ease.

### 🗺️ Nearby Facilities
- Find nearby hospitals and pharmacies with real-time location tracking.
- Search by city or current location.

### 🤖 AI Integration
- Leverage AI-powered insights for better decision-making.
- Explore AI-generated content for healthcare solutions.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun (package managers)
- A `.env` file with the following variables:
  ```env
  NEXT_PUBLIC_BACKEND=<your_backend_url>
  NEXT_PUBLIC_GAPI=<your_google_api_key>
  ```

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/trufurs/mediq.git
   cd mediq
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:4000](http://localhost:4000) in your browser to see the app.

---

## Project Structure

```
project/
├── app/                # Next.js app directory
│   ├── (auth)/         # Authentication pages (login, signup)
│   ├── ai/             # AI-powered features
│   ├── inventory/      # Inventory management
│   ├── map/            # Nearby facilities map
│   ├── medicine/       # Medicine search and details
│   ├── orders/         # Order management
│   ├── requests/       # Requests management
│   └── layout.tsx      # Global layout
├── components/         # Reusable React components
├── styles/             # Global and custom CSS
├── utils/              # Utility functions (API calls, middleware)
├── public/             # Static assets (images, icons)
├── .env                # Environment variables
├── package.json        # Project metadata and dependencies
└── README.md           # Project documentation
```

---

## Scripts

- **`npm run dev`**: Start the development server.
- **`npm run build`**: Build the app for production.
- **`npm run start`**: Start the production server.
- **`npm run lint`**: Run ESLint to check for code issues.

---

## Technologies Used

- **Frontend**: [React](https://reactjs.org), [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com)
- **Backend**: REST API integration with `NEXT_PUBLIC_BACKEND`
- **Database**: MongoDB (or any backend database connected to the API)
- **AI**: [Google GenAI](https://cloud.google.com/genai) for AI-powered features
- **Maps**: [Leaflet](https://leafletjs.com) for interactive maps

---

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
NEXT_PUBLIC_BACKEND=<your_backend_url>
NEXT_PUBLIC_GAPI=<your_google_api_key>
```

---

## Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com). Follow these steps:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Add your environment variables in the Vercel dashboard.
4. Deploy your app with a single click.

---

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or feedback, please reach out to us at [himanshujain2033@gmail.com](mailto:himanshujain2033@gmail.com).

---

## Acknowledgments

- [Next.js](https://nextjs.org) for the amazing framework.
- [Tailwind CSS](https://tailwindcss.com) for the beautiful styling.
- [Google GenAI](https://cloud.google.com/genai) for AI-powered features.
- [Leaflet](https://leafletjs.com) for interactive maps.

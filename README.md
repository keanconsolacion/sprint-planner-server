# Preview

https://github.com/user-attachments/assets/90a5bc82-424a-4521-95a0-2f722e8d08d9

# About

SprintPlanner facilitates real-time collaborative planning poker sessions. Users can anonymously select and submit card values, fostering efficient and insightful decision-making.

**Technologies:**

* **Frontend:** React.js with Vite, Tailwind CSS, and Shadcn for UI components
* **Backend:** Node.js with Socket.IO for real-time communication

## UI repository link
- https://github.com/keanconsolacion/sprint-planner

## Getting Started

1. **Clone the FRONTEND repository:**
   ```bash
   git clone https://github.com/keanconsolacion/sprint-planner.git
   ```
2. **Clone the BACKEND repository:**
   ```bash
   git clone https://github.com/keanconsolacion/sprint-planner-server.git
   ```
3. **Install dependencies:**
   ```bash
   pnpm install
   ```
4. **Start the server**
   ```bash
   pnpm start
   ```
5. **Start the frontend**
   ```bash
   pnpm run dev
   
   or
   
   pnpm run build 
   ```

## Usage

- Access the Application:
  - Open your web browser and navigate to http://localhost:5173 (or the specified port).
- Create a Room:
  - Enter your username.
  - Choose a room name.
  - Select the desired point values type (e.g., 0-10 points).

- Invite Others:
  - Click the "Copy Invite URL" button to generate a unique link.
  - Share this link with the other participants.

- Start Voting:
  - Wait for other users to join the room.
  - Once a sufficient number of users have joined, click the "Start Voting" button.

- Cast Votes:
  - Each participant will be able to cast their vote.

- View Results:
  - Click the "End Voting" button to display the voting summary.
  - All users will be able to see the median, average, and the number of votes.

- Start Again:
  - Click the "Start Another" button to begin a new voting session.

## Contributing
- Contributions are welcome! Please feel free to submit a pull request or open an issue.

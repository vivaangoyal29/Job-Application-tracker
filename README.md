# Job Application Tracker

A dynamic web application to help job seekers track their job applications using a Kanban board interface.

## Features

- **Kanban Board Layout**
  - Track applications across different stages:
    - Applied
    - Interview
    - Offer
    - Rejected

- **Job Management**
  - Add new job applications
  - Edit existing applications
  - Delete applications
  - Drag and drop between status columns
  - Schedule interviews with date/time

- **Statistics Dashboard**
  - Total applications
  - Interview success rate
  - Offer rate

- **Job Recommendations**
  - Search jobs by field/category
  - Powered by Adzuna Jobs API
  - Add recommended jobs directly to board

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Local Storage for data persistence
- Adzuna Jobs API for job recommendations

## Getting Started

1. Clone the repository:
```bash
git clone [your-repository-url]
```

2. Open the project in your preferred code editor

3. Launch with a local server (e.g., using Live Server in VS Code)

## Usage

### Adding a Job
- Click "+ Add Job" button
- Fill in company name, position, and notes
- Click "Save"

### Moving Jobs
- Drag and drop cards between columns
- Schedule interview dates when moving to "Interview" stage

### Job Search
- Use the field selector to choose job category
- Click "Search" to find recommendations
- Click "Add to Kanban" to add jobs to your board

## Project Structure

```
final term project/
│
├── index1.html      # Main HTML file
├── style1.css       # Styles
├── script1.js       # JavaScript logic
└── README.md        # Documentation
```

## Local Storage

The application uses browser's Local Storage to persist:
- Job applications
- Status updates
- Interview schedules

## API Integration

Uses Adzuna Jobs API for job recommendations:
- API ID: 2e26c206
- Results per page: 5
- Location: GB (Great Britain)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Adzuna API for job listings
- Drag and Drop HTML5 API
- Modern JavaScript features
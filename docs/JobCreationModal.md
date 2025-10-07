# Job Creation Modal Component

A reusable, configurable job creation modal that can be used for any job type with minimal setup.

## 🚀 Quick Usage

### 1. Import the Component and Configuration

```javascript
import JobCreationModal from "@/components/shared/JobCreationModal";
import { jobTypeConfigs } from "@/lib/jobTypeConfigs";
```

### 2. Add State Management

```javascript
const [newJobModalOpen, setNewJobModalOpen] = useState(false);
const [clientNameForModal, setClientNameForModal] = useState(""); // Store client name from URL
```

### 3. Create URL Parameter Handler

```javascript
// Check URL parameters for new job creation
useEffect(() => {
  const isNew = searchParams.get('new') === 'true';
  const clientName = searchParams.get('clientName');
  
  if (isNew) {
    setNewJobModalOpen(true);
    // Store client name before clearing URL parameters
    if (clientName) {
      setClientNameForModal(decodeURIComponent(clientName));
    }
    // Clean up URL parameters
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }
}, [searchParams]);
```

### 4. Create Handlers

```javascript
const handleJobCreated = (newJob) => {
  // Add new job to your list
  setJobs(prev => [newJob, ...prev]);
};

const handleJobCreationError = (errorMessage) => {
  setError(errorMessage);
};

const handleCloseNewJobModal = () => {
  setNewJobModalOpen(false);
  setClientNameForModal(""); // Reset client name when modal closes
};
```

### 5. Use the Component

```javascript
<JobCreationModal
  isOpen={newJobModalOpen}
  onClose={handleCloseNewJobModal}
  onJobCreated={handleJobCreated}           // Called when job is successfully created
  onError={handleJobCreationError}          // Called when there's an error
  jobType="drop-cable"                      // Job type key
  jobConfig={jobTypeConfigs["drop-cable"]}  // Configuration object
  clientId={clientId}                       // Client ID for the job
  clientName={clientNameForModal}                // Client name from stored state
/>
```

## 📋 Available Job Types

The system comes pre-configured with the following job types:

- **drop-cable** - Drop Cable Installations
- **floating-civils** - Floating Civils (ADW)  
- **link-build** - Link Build Projects
- **maintenance** - Maintenance & Repairs
- **access-build** - Access Build Projects
- **root-build** - Root Build Projects
- **relocations** - Equipment Relocations

## 🛠 Creating New Job Types

To add a new job type, simply add a configuration to `lib/jobTypeConfigs.js`:

```javascript
export const jobTypeConfigs = {
  // ... existing configs
  
  "my-new-job-type": {
    title: "My New Job Type",
    shortName: "New Job",
    description: "Add a new custom job for this client",
    apiEndpoint: "/my-api-endpoint",
    sections: [
      {
        title: "Basic Information",
        icon: Building2,
        className: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: [
          {
            name: "field_name",
            label: "Field Label",
            type: "text", // text, number, email, date, time, select, textarea
            placeholder: "Enter value...",
            icon: Hash, // Optional icon component
            defaultValue: "default", // Optional default value
            options: [ // For select fields only
              { value: "value1", label: "Option 1" },
              { value: "value2", label: "Option 2" }
            ]
          }
        ]
      }
    ]
  }
};
```

## 🎨 Form Features

### Field Types Supported
- **text** - Text input
- **number** - Number input  
- **email** - Email input
- **date** - Date picker
- **time** - Time picker
- **select** - Dropdown selection
- **textarea** - Multi-line text area

### Automatic Features
- ✅ **Endpoint Selection** - Automatically uses the correct API endpoint from job configuration
- ✅ Form validation and sanitization
- ✅ Proper data type conversion
- ✅ Date/time formatting for backend compatibility
- ✅ Loading states and error handling
- ✅ Client auto-population from URL parameters
- ✅ Responsive design and dark mode support
- ✅ Professional form sections with icons and styling

### Layout Options
- Configure grid layouts with `gridCols` (e.g., "grid-cols-1 md:grid-cols-3")
- Add custom section styling with `className`
- Support for field spanning multiple columns
- Icons for both sections and individual fields

## 🔗 Integration with Dashboard

The dashboard automatically supports all configured job types. When users click "New Job":

1. They select a job type from the dropdown
2. They select a client
3. The system navigates to `/clients/{id}/{job-type}?new=true&clientName=...`
4. The target page detects the URL parameters and opens the modal
5. The client name is auto-populated

## 📱 Pages That Use This Component

### Existing Implementation
- **Drop Cable Page** - `/clients/[id]/drop_cable/page.js`
- **Maintenance Page** - `/clients/[id]/maintenance/page.js`

### Easy to Add
Just create a new page file following the same pattern and change:
- The job type key
- The API endpoint for fetching jobs
- The status formatting functions

## ⚡ Benefits

1. **Consistency** - All job creation forms look and behave the same
2. **Maintainability** - Changes to form behavior update all job types
3. **Extensibility** - New job types require minimal code
4. **Reusability** - One component handles all scenarios
5. **Type Safety** - Clear configuration structure prevents errors
6. **User Experience** - Professional, responsive forms with proper validation

This componentized approach makes it incredibly easy to add new job types while maintaining consistency across the entire application! 🎉
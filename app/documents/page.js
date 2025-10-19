"use client";

import { useState } from "react";

// Dummy data structure
const dummyDocuments = {
  employees: {
    name: "Employee Documents",
    icon: "users",
    color: "blue",
    children: [
      {
        id: 1,
        name: "John Doe",
        type: "folder",
        documents: [
          {
            id: 101,
            name: "Employment_Contract.pdf",
            size: "2.3 MB",
            date: "2024-01-15",
            type: "pdf",
          },
          {
            id: 102,
            name: "ID_Copy.pdf",
            size: "1.1 MB",
            date: "2024-01-15",
            type: "pdf",
          },
          {
            id: 103,
            name: "Bank_Details.pdf",
            size: "0.5 MB",
            date: "2024-01-20",
            type: "pdf",
          },
        ],
      },
      {
        id: 2,
        name: "Jane Smith",
        type: "folder",
        documents: [
          {
            id: 201,
            name: "Employment_Contract.pdf",
            size: "2.1 MB",
            date: "2024-02-01",
            type: "pdf",
          },
          {
            id: 202,
            name: "Qualifications.pdf",
            size: "3.2 MB",
            date: "2024-02-01",
            type: "pdf",
          },
        ],
      },
    ],
  },
  projects: {
    name: "Project Documents",
    icon: "briefcase",
    color: "emerald",
    children: [
      {
        id: 3,
        name: "Dark Fiber Installation",
        type: "folder",
        documents: [
          {
            id: 301,
            name: "Project_Proposal.pdf",
            size: "5.2 MB",
            date: "2024-03-10",
            type: "pdf",
          },
          {
            id: 302,
            name: "Site_Survey.xlsx",
            size: "1.8 MB",
            date: "2024-03-15",
            type: "excel",
          },
          {
            id: 303,
            name: "Budget_Breakdown.xlsx",
            size: "0.9 MB",
            date: "2024-03-12",
            type: "excel",
          },
          {
            id: 304,
            name: "Site_Photos.zip",
            size: "45.3 MB",
            date: "2024-03-20",
            type: "archive",
          },
        ],
      },
      {
        id: 4,
        name: "Drop Cable Project - Site A",
        type: "folder",
        documents: [
          {
            id: 401,
            name: "AsBuilt_Drawing.pdf",
            size: "8.1 MB",
            date: "2024-04-05",
            type: "pdf",
          },
          {
            id: 402,
            name: "Completion_Report.pdf",
            size: "2.3 MB",
            date: "2024-04-10",
            type: "pdf",
          },
        ],
      },
    ],
  },
  dropcable: {
    name: "Drop Cable Orders",
    icon: "cable",
    color: "purple",
    children: [
      {
        id: 5,
        name: "Circuit_DC_001",
        type: "folder",
        documents: [
          {
            id: 501,
            name: "Survey_Report.pdf",
            size: "3.4 MB",
            date: "2024-05-01",
            type: "pdf",
          },
          {
            id: 502,
            name: "Installation_Photos.zip",
            size: "23.1 MB",
            date: "2024-05-10",
            type: "archive",
          },
          {
            id: 503,
            name: "AsBuilt_Document.pdf",
            size: "4.2 MB",
            date: "2024-05-15",
            type: "pdf",
          },
        ],
      },
      {
        id: 6,
        name: "Circuit_DC_002",
        type: "folder",
        documents: [
          {
            id: 601,
            name: "Customer_Approval.pdf",
            size: "1.2 MB",
            date: "2024-05-20",
            type: "pdf",
          },
        ],
      },
    ],
  },
  financial: {
    name: "Financial Documents",
    icon: "dollar",
    color: "amber",
    children: [
      {
        id: 7,
        name: "Invoices",
        type: "folder",
        documents: [
          {
            id: 701,
            name: "INV_2024_001.pdf",
            size: "0.8 MB",
            date: "2024-01-31",
            type: "pdf",
          },
          {
            id: 702,
            name: "INV_2024_002.pdf",
            size: "0.9 MB",
            date: "2024-02-28",
            type: "pdf",
          },
          {
            id: 703,
            name: "INV_2024_003.pdf",
            size: "1.1 MB",
            date: "2024-03-31",
            type: "pdf",
          },
        ],
      },
      {
        id: 8,
        name: "Quotes",
        type: "folder",
        documents: [
          {
            id: 801,
            name: "Quote_Client_A.pdf",
            size: "1.5 MB",
            date: "2024-04-15",
            type: "pdf",
          },
          {
            id: 802,
            name: "Quote_Client_B.pdf",
            size: "1.3 MB",
            date: "2024-04-20",
            type: "pdf",
          },
        ],
      },
    ],
  },
};

const FolderItem = ({ folder, level = 0, categoryColor }) => {
  const [isOpen, setIsOpen] = useState(level === 0);

  return (
    <div className="space-y-1">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg
            className="w-4 h-4 text-slate-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            )}
          </svg>
          <svg
            className={`w-5 h-5 text-${categoryColor}-500 flex-shrink-0`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            )}
          </svg>
          <span className="font-medium text-slate-900 dark:text-white truncate">
            {folder.name}
          </span>
          <span className="text-xs text-slate-400 ml-auto flex-shrink-0">
            {folder.documents?.length || 0} files
          </span>
        </div>
      </div>

      {isOpen && folder.documents && (
        <div className="space-y-1">
          {folder.documents.map((doc) => {
            const fileColor =
              doc.type === "pdf"
                ? "text-red-500"
                : doc.type === "excel"
                  ? "text-emerald-500"
                  : doc.type === "archive"
                    ? "text-amber-500"
                    : "text-slate-500";

            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                style={{ paddingLeft: `${(level + 1) * 24 + 36}px` }}
              >
                <svg
                  className={`w-4 h-4 ${fileColor} flex-shrink-0`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                    <svg
                      className="w-4 h-4 text-slate-600 dark:text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                    <svg
                      className="w-4 h-4 text-slate-600 dark:text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                    <svg
                      className="w-4 h-4 text-slate-600 dark:text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CategorySection = ({ category, data }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalFiles = data.children.reduce((acc, folder) => {
    return acc + (folder.documents?.length || 0);
  }, 0);

  const iconMap = {
    users: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
    briefcase: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    cable: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    ),
    dollar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-4 p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div
          className={`w-12 h-12 bg-${data.color}-50 dark:bg-${data.color}-900/20 rounded-xl flex items-center justify-center flex-shrink-0`}
        >
          <svg
            className={`w-6 h-6 text-${data.color}-600 dark:text-${data.color}-400`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {iconMap[data.icon]}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {data.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {data.children.length} folders • {totalFiles} files
          </p>
        </div>
        <svg
          className="w-5 h-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isExpanded ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          )}
        </svg>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-1">
          {data.children.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              level={0}
              categoryColor={data.color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const stats = (() => {
    let totalFolders = 0;
    let totalFiles = 0;
    let totalSize = 0;

    Object.values(dummyDocuments).forEach((category) => {
      totalFolders += category.children.length;
      category.children.forEach((folder) => {
        totalFiles += folder.documents?.length || 0;
        folder.documents?.forEach((doc) => {
          const sizeNum = parseFloat(doc.size);
          totalSize += sizeNum;
        });
      });
    });

    return { totalFolders, totalFiles, totalSize: totalSize.toFixed(1) };
  })();

  return (
    // <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    //   {/* Header */}
    //   <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
    //     <div className="p-8">
    //       <div className="flex items-center justify-between mb-6">
    //         <div className="flex items-center gap-4">
    //           <div className="relative">
    //             <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
    //               <svg
    //                 className="w-8 h-8 text-white"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //                 stroke="currentColor"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth={2}
    //                   d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    //                 />
    //               </svg>
    //             </div>
    //             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
    //           </div>
    //           <div>
    //             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
    //               Document Management
    //             </h1>
    //             <p className="text-slate-600 dark:text-slate-400 mt-1">
    //               Access and manage all system documents
    //             </p>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Stats */}
    //       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    //         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
    //           <div className="flex items-center gap-3">
    //             <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
    //               <svg
    //                 className="w-5 h-5 text-blue-600 dark:text-blue-400"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //                 stroke="currentColor"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth={2}
    //                   d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    //                 />
    //               </svg>
    //             </div>
    //             <div>
    //               <p className="text-2xl font-bold text-slate-900 dark:text-white">
    //                 {stats.totalFolders}
    //               </p>
    //               <p className="text-xs text-slate-600 dark:text-slate-400">
    //                 Total Folders
    //               </p>
    //             </div>
    //           </div>
    //         </div>

    //         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
    //           <div className="flex items-center gap-3">
    //             <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
    //               <svg
    //                 className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //                 stroke="currentColor"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth={2}
    //                   d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    //                 />
    //               </svg>
    //             </div>
    //             <div>
    //               <p className="text-2xl font-bold text-slate-900 dark:text-white">
    //                 {stats.totalFiles}
    //               </p>
    //               <p className="text-xs text-slate-600 dark:text-slate-400">
    //                 Total Files
    //               </p>
    //             </div>
    //           </div>
    //         </div>

    //         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
    //           <div className="flex items-center gap-3">
    //             <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
    //               <svg
    //                 className="w-5 h-5 text-purple-600 dark:text-purple-400"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //                 stroke="currentColor"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth={2}
    //                   d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
    //                 />
    //               </svg>
    //             </div>
    //             <div>
    //               <p className="text-2xl font-bold text-slate-900 dark:text-white">
    //                 {stats.totalSize} MB
    //               </p>
    //               <p className="text-xs text-slate-600 dark:text-slate-400">
    //                 Total Storage
    //               </p>
    //             </div>
    //           </div>
    //         </div>

    //         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
    //           <div className="flex items-center gap-3">
    //             <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
    //               <svg
    //                 className="w-5 h-5 text-amber-600 dark:text-amber-400"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //                 stroke="currentColor"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth={2}
    //                   d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    //                 />
    //               </svg>
    //             </div>
    //             <div>
    //               <p className="text-2xl font-bold text-slate-900 dark:text-white">
    //                 24
    //               </p>
    //               <p className="text-xs text-slate-600 dark:text-slate-400">
    //                 Recent Uploads
    //               </p>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Search and Filters */}
    //   <div className="p-8 pb-0">
    //     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
    //       <div className="flex flex-col md:flex-row gap-4">
    //         <div className="flex-1 relative">
    //           <svg
    //             className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
    //             fill="none"
    //             viewBox="0 0 24 24"
    //             stroke="currentColor"
    //           >
    //             <path
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //               strokeWidth={2}
    //               d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    //             />
    //           </svg>
    //           <input
    //             type="text"
    //             placeholder="Search documents, folders, or categories..."
    //             value={searchTerm}
    //             onChange={(e) => setSearchTerm(e.target.value)}
    //             className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //           />
    //         </div>
    //         <div className="flex gap-2">
    //           <button className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
    //             <svg
    //               className="w-5 h-5 text-slate-600 dark:text-slate-400"
    //               fill="none"
    //               viewBox="0 0 24 24"
    //               stroke="currentColor"
    //             >
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth={2}
    //                 d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    //               />
    //             </svg>
    //             <span className="text-sm font-medium text-slate-900 dark:text-white">
    //               Filters
    //             </span>
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Document Tree */}
    //   <div className="p-8 pt-0 space-y-6">
    //     {Object.entries(dummyDocuments).map(([key, data]) => (
    //       <CategorySection key={key} category={key} data={data} />
    //     ))}
    //   </div>
    // </div>
    <div className="flex items-center justify-center mt-10">
      <h1 className="text-center mt-50 text-xl">Coming soon...</h1>
    </div>
  );
}

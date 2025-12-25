import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadFile, fetchFiles, deleteFile, downloadFile } from "@/api/files";
import {
  Search,
  Download,
  Trash,
  MessagesSquare,
  UploadCloud,
  Slash,
  Loader2,
  RefreshCw,
  File,
  FileText,
  FileSpreadsheet,
  FileJson,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { saveAs } from "file-saver";
import { ALLOWED_EXTENSIONS } from "@/lib/constants";

type UploadedFile = {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  uploadedAt: string;
};

const getFileIcon = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return <File className="w-6 h-6 text-red-500" />;
    case "csv":
    case "xlsx":
      return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
    case "json":
      return <FileJson className="w-6 h-6 text-yellow-500" />;
    case "md":
    case "txt":
      return <FileText className="w-6 h-6 text-blue-500" />;
    default:
      return <File className="w-6 h-6 text-gray-400" />;
  }
};

function FilesPage() {
  const queryClient = useQueryClient();
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    refetch,
    isRefetching,
  } = useQuery<UploadedFile[]>({
    queryKey: ["files"],
    queryFn: fetchFiles,
    staleTime: 1000 * 60 * 3,
  });

  const [searchText, setSearchText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isActionLoading, setIsActionLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const filesArray = Array.from(newFiles);

    // Validate extensions
    const invalidFiles = filesArray.filter((file) => {
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      return !ALLOWED_EXTENSIONS.includes(ext);
    });

    if (invalidFiles.length > 0) {
      toast.error(
        `Invalid file type: ${invalidFiles[0].name}. Only ${ALLOWED_EXTENSIONS.join(
          ", "
        )} files are accepted.`
      );
      return;
    }

    const existingFileNames = new Set(files.filter((f) => f?.filename).map((f) => f.filename));
    for (const file of filesArray) {
      if (existingFileNames.has(file.name)) {
        toast.error(`File "${file.name}" already exists. Please rename the file before uploading.`);
        return;
      }
    }

    setIsActionLoading(true);
    const uploadPromises = filesArray.map(async (file) => {
      try {
        const uploaded = await uploadFile(file);
        return uploaded;
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    setIsActionLoading(false);
    const successfulUploads = results.filter((f) => f !== null) as UploadedFile[];

    if (successfulUploads.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success(`Successfully uploaded ${successfulUploads.length} file(s).`);
    }
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  };

  const filteredFiles = files.filter((f) => {
    if (!searchText) return true;
    return f?.filename?.toLowerCase().includes(searchText.toLowerCase());
  });

  const toggleSelectAll = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};

    filteredFiles.forEach((f) => {
      newSelection[f.id] = checked;
    });

    setSelected((prev) => ({ ...prev, ...newSelection }));
  };

  // individual checkbox
  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  // delete selected files
  const deleteSelected = async () => {
    const idsToDelete = Object.keys(selected).filter((id) => selected[id]);

    if (idsToDelete.length === 0) return;

    setIsActionLoading(true);
    try {
      await Promise.all(idsToDelete.map((id) => deleteFile(id)));
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setSelected({}); // clear selection
      toast.success("Files deleted successfully.");
    } catch (error) {
      console.error("Failed to delete files:", error);
      toast.error("Failed to delete some files.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // download selected files
  const downloadSelected = async () => {
    const idsToDownload = Object.keys(selected).filter((id) => selected[id]);

    if (idsToDownload.length === 0) return;

    for (const id of idsToDownload) {
      const fileObj = files.find((f) => f.id === id);
      if (fileObj) {
        try {
          const blob = await downloadFile(fileObj.id);
          saveAs(blob, fileObj.filename);
        } catch (error) {
          console.error(`Failed to download file ${fileObj.filename}:`, error);
          toast.error(`Failed to download ${fileObj.filename}`);
        }
      }
    }
  };

  const handleChatWithFiles = () => {
    const selectedIds = Object.keys(selected).filter((id) => selected[id]);
    const selectedFiles = files.filter((f) => selectedIds.includes(f.id));
    navigate("/", {
      state: {
        mode: "chat-with-files",
        files: selectedFiles,
      },
    });
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-semibold font-serif text-text-title-light">My Files</h2>
        <p className="text-text-desc-light mt-2">All files that have been uploaded to Cognitus</p>
      </div>

      {/* ========== UPLOAD AREA ========== */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud className="w-12 h-12 mx-auto text-gray-500" />
        <p className="font-semibold text-lg">Drag & Drop your files here</p>
        <p>or click to upload</p>
        <p className="text-xs text-gray-400 mt-2">
          Accepted formats: {ALLOWED_EXTENSIONS.join(", ")}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* ========== FILE LIST SECTION ========== */}
      <div className="flex justify-between items-center mt-10 mb-4">
        {/* ----- Header: Search + buttons ----- */}
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted-light" />
          <Input
            type="text"
            placeholder="Search files..."
            className="w-full pl-10 py-2 border border-gray-300 rounded-lg text-text-desc-light focus:ring-primary focus:border-primary"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex gap-2 cursor-pointer"
            onClick={downloadSelected}
            disabled={Object.values(selected).every((v) => !v)}
          >
            <Download className="w-6 h-6" /> Download
          </Button>

          <Button
            variant="outline"
            className="flex gap-2 cursor-pointer"
            onClick={deleteSelected}
            disabled={Object.values(selected).every((v) => !v)}
          >
            <Trash className="w-6 h-6" /> Delete
          </Button>

          <Button
            variant="outline"
            className="flex gap-2 cursor-pointer"
            onClick={handleChatWithFiles}
            disabled={Object.values(selected).every((v) => !v) || isActionLoading}
          >
            {isActionLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <MessagesSquare className="w-6 h-6" />
            )}{" "}
            Chat with Files
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            onClick={() => refetch()}
            disabled={isLoadingFiles || isActionLoading}
            title="Refresh files"
          >
            <RefreshCw className={`w-6 h-6 ${isRefetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ----- File List (Table) ----- */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-text-muted-light">
                {filteredFiles.length > 0 && (
                  <Checkbox data-id="select-all" onCheckedChange={(v) => toggleSelectAll(!!v)} />
                )}
              </th>
              <th className="px-6 py-3 text-sm font-medium text-text-muted-light">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-text-muted-light">Size</th>
              <th className="px-6 py-3 text-sm font-medium text-text-muted-light">Upload Date</th>
            </tr>
          </thead>

          <tbody>
            {isLoadingFiles || isRefetching ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-text-desc-light">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                  <p>Loading your files...</p>
                </td>
              </tr>
            ) : filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-text-desc-light">
                  <Slash className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p>
                    Hey, it looks like you haven’t uploaded any files yet. Upload some files to
                    start chatting with them!
                  </p>
                </td>
              </tr>
            ) : (
              filteredFiles.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-6 py-3">
                    <Checkbox
                      data-id={f.id}
                      checked={!!selected[f.id]}
                      onCheckedChange={(v) => toggleSelect(f.id, !!v)}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(f.filename)}
                      <span className="truncate" title={f.filename}>
                        {f.filename}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">{(f.size / 1024).toFixed(1)} KB</td>
                  <td className="px-6 py-3">
                    {f.uploadedAt ? (
                      <>
                        {new Date(f.uploadedAt).toLocaleDateString()}{" "}
                        {new Date(f.uploadedAt).toLocaleTimeString()}
                      </>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FilesPage;

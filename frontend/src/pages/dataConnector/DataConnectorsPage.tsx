import { useState } from "react";
import DatabaseConnectorModel from "./DatabaseConnectorModel";
import postgreLogo from "../../assets/Postgres_logo.webp";
import mysqlLogo from "../../assets/mysql_logo.webp";
import supabaseLogo from "../../assets/supabase-logo.webp";
import toast from "react-hot-toast";
import { Calendar, Database, Trash2, User } from "lucide-react";
import { useConnections, type SavedConnection } from "@/hooks/useConnections";

export const connectors = [
  {
    name: "MySQL",
    description: "Connect your MySQL database for direct querying and analysis",
    icon: mysqlLogo,
  },
  {
    name: "PostgreSQL",
    description: "Analyze your PostgreSQL database tables and schemas",
    icon: postgreLogo,
  },
  {
    name: "Supabase",
    description: "Connect your Supabase database for direct querying and analysis",
    icon: supabaseLogo,
  },
];

function DataConnectorsPage() {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"MySQL" | "PostgreSQL" | "Supabase">("MySQL");
  const [isLoading, setIsLoading] = useState(false);

  const { connections, addConnection, removeConnection } = useConnections();

  const handleConnect = (data: Record<string, string>) => {
    setIsLoading(true);

    setTimeout(() => {
      const newConnection: SavedConnection = {
        id: crypto.randomUUID(),
        type: selectedType,
        connectionName: data.connectionName,
        user: data.user,
        database: data.database,
        details: data,
        createdAt: new Date().toISOString(),
      };
      addConnection(newConnection);

      setIsLoading(false);
      setOpen(false);

      toast.success("Connection successful");
    }, 1000);
  };

  const getIcon = (type: string) => {
    return connectors.find(c => c.name === type)?.icon;
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-semibold font-serif text-text-title-light">Data Connectors</h2>
        <p className="text-text-desc-light mt-2">
          You can connect Cognitus to your data stores and business tools here
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectors.map((connector, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <img
                src={connector.icon}
                alt={`${connector.name} logo`}
                className="w-10 h-10 object-contain mb-4"
              />
              <h4 className="font-semibold text-text-title-light">{connector.name}</h4>
              <p className="text-sm text-text-desc-light mt-2">{connector.description}</p>
            </div>
            <button
              className="mt-6 px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-blue-600 w-full"
              onClick={() => {
                setSelectedType(connector.name as any);
                setOpen(true);
              }}
            >
              Connect
            </button>
          </div>
        ))}

        {/* Modal */}
        <DatabaseConnectorModel
          open={open}
          onClose={() => setOpen(false)}
          type={selectedType}
          onConnect={handleConnect}
          isLoading={isLoading}
        />
      </div>

      {connections.length > 0 && (
        <div className="pt-4">
          <h3 className="text-xl font-semibold text-text-title-light mb-4">Active Connections</h3>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-15 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-sm font-medium text-gray-500">
              <div className="col-span-3">Name & Type</div>
              <div className="col-span-3">Database Name</div>
              <div className="col-span-3">User</div>
              <div className="col-span-3">Created At</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-gray-100 text-font-medium text-foreground">
              {connections.map((conn) => (
                <div key={conn.id} className=" grid grid-cols-15 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 flex-shrink-0 bg-white border border-gray-200 rounded-full flex items-center justify-center p-1.5">
                      <img src={getIcon(conn.type)} alt={conn.type} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-medium text-text-title-light truncate">{conn.connectionName}</p>
                      <p className="text-xs text-gray-400">{conn.type}</p>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center gap-2 text-sm text-gray-600">
                    <Database className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{conn.database}</span>
                  </div>

                  <div className="col-span-3 flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{conn.user}</span>
                  </div>

                  <div className="col-span-3 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{conn.createdAt}</span>
                  </div>

                  <div className="col-span-3 flex justify-end">
                    <button
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                      onClick={() => removeConnection(conn.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataConnectorsPage;

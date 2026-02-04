import { useState } from 'react';
import { format } from 'date-fns';
import { Bell, CheckCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import { type Alert } from '@/types/Alert';
import { useAlerts, useUnsentAlerts, useMarkAlertsAsRead, useResolveAlert } from '@/hooks/useAlerts';
import { useAuth } from '@/context/AuthProvider';

type TabType = 'unread' | 'active' | 'resolved';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('unread');
  const { token } = useAuth();
  
  // Conditionally use varying hooks based on active tab
  // Or fetch generically and conditionally invoke
  // Since rules of hooks prevent conditional hook calls, we call all or use the generic one properly.
  // The useAlerts hook handles optional params.
  
  // Unread Alerts
  const { data: unsentAlerts, isLoading: isLoadingUnsent } = useUnsentAlerts(token || undefined);
  
  // Active (Read but Unresolved)
  const { data: activeAlerts, isLoading: isLoadingActive } = useAlerts(token || undefined, false, true);

  // Resolved
  const { data: resolvedAlerts, isLoading: isLoadingResolved } = useAlerts(token || undefined, true);

  const markAsReadMutation = useMarkAlertsAsRead(token || undefined);
  const resolveMutation = useResolveAlert(token || undefined);

  // Determine current list to show
  let alerts: Alert[] | undefined = [];
  let isLoading = false;
  
  if (activeTab === 'unread') {
      alerts = unsentAlerts;
      isLoading = isLoadingUnsent;
  } else if (activeTab === 'active') {
      alerts = activeAlerts;
      isLoading = isLoadingActive;
  } else {
      alerts = resolvedAlerts;
      isLoading = isLoadingResolved;
  }

  // Effect to mark unread alerts as read when viewing unread tab



  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'TEMP': return <AlertTriangle className="text-red-500" />;
      case 'WEIGHT': return <AlertTriangle className="text-orange-500" />;
      case 'EXPIRY': return <Clock className="text-red-600" />;
      case 'EXPIRY_WARNING': return <Clock className="text-yellow-500" />;
      default: return <Bell className="text-blue-500" />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell /> Centrum Alertów
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('unread')}
          className={`pb-2 px-4 transition-colors relative ${
            activeTab === 'unread' 
              ? 'border-b-2 border-primary-600 text-primary-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nowe (Nieodczytane)
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-4 transition-colors ${
            activeTab === 'active' 
              ? 'border-b-2 border-primary-600 text-primary-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Aktywne (Odczytane)
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`pb-2 px-4 transition-colors ${
            activeTab === 'resolved' 
              ? 'border-b-2 border-primary-600 text-primary-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rozwiązane (Archiwum)
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow min-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Ładowanie powiadomień...</div>
        ) : alerts && alerts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {alerts.map((alert: Alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50 flex items-start justify-between gap-4 transition-colors">
                <div className="flex gap-4">
                  <div className="mt-1 p-2 bg-gray-100 rounded-full">
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.message}</h3>
                    <div className="text-sm text-gray-500 mt-1 flex gap-3">
                        <span className="whitespace-nowrap">{format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}</span>
                      <span className="bg-gray-100 px-2 rounded text-xs py-0.5 border border-gray-200 uppercase">{alert.alert_type}</span>
                      {alert.rack_id && <span>Regał ID: {alert.rack_id}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                    {!alert.is_sent && (
                    <button
                        onClick={() => markAsReadMutation.mutate([alert.id])}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                        title="Oznacz jako odczytane"
                    >
                        <Eye size={16} /> Odczytane
                    </button>
                    )}

                    {!alert.is_resolved && (
                    <button
                        onClick={() => resolveMutation.mutate(alert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors border border-green-200"
                        title="Oznacz jako rozwiązane"
                    >
                        <CheckCircle size={16} /> Rozwiąż
                    </button>
                    )}
                    {alert.is_resolved && (
                    <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-full">
                        Rozwiązane
                    </span>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>Brak powiadomień w tej kategorii</p>
          </div>
        )}
      </div>
    </div>
  );
}

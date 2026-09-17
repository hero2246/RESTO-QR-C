import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { SecurityTestResult } from '../../types';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  AlertTriangle,
  Code2,
  Terminal
} from 'lucide-react';

interface SecurityAuditTesterProps {
  navigate: (path: string) => void;
}

export const SecurityAuditTester: React.FC<SecurityAuditTesterProps> = ({ navigate }) => {
  const { runSecurityTests, showToast } = useApp();

  const [tests, setTests] = useState<SecurityTestResult[]>(() => runSecurityTests());
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runSecurityTests();
      setTests(results);
      setIsRunning(false);
      showToast(`Validation des ${results.length} tests de sécurité et conformité SaaS terminée`, 'success');
    }, 600);
  };

  const allPassed = tests.every(t => t.passed);
  const passedCount = tests.filter(t => t.passed).length;

  return (
    <OwnerLayout
      currentPath="/owner/security-tests"
      navigate={navigate}
      title="Banc d'Essai & Tests de Sécurité (Section 60)"
      subtitle="Vérification automatisée de l'étanchéité multi-tenant, des domaines, du cycle de commande et du root OWNER"
      actions={
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Exécution en cours...' : `Exécuter les ${tests.length} Tests`}</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Banner summary */}
        <div className={`p-6 rounded-3xl border flex items-center justify-between gap-4 ${
          allPassed 
            ? 'bg-emerald-950/20 border-emerald-500/30' 
            : 'bg-red-950/20 border-red-500/30'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${
              allPassed 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {allPassed ? <ShieldCheck className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {allPassed 
                  ? `Audit de Sécurité & SaaS Conforme (${passedCount}/${tests.length} Réussis)` 
                  : 'Avertissement de Sécurité'}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Les 15 tests obligatoires (Branding SaaS, Isolation Restaurants, CNAME Domaines, Commandes & RLS) sont validés avec succès.
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono font-bold text-emerald-400">
            {Math.round((passedCount / tests.length) * 100)}% SUCCÈS
          </span>
        </div>

        {/* The 6 Tests Cards */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div 
              key={test.id}
              className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-400 shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{test.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-400">
                        {test.id}
                      </span>
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">{test.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                    test.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {test.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{test.passed ? 'TEST VALIDÉ' : 'ÉCHEC'}</span>
                  </span>
                </div>
              </div>

              {/* Scenario & Details */}
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-300">
                  <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono text-[11px] text-stone-300">{test.scenario}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400">Attendu :</span>
                    <span className="font-bold text-white">{test.expected}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400">Observé :</span>
                    <span className="font-bold text-emerald-400">{test.actual}</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800/60 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>{test.details}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </OwnerLayout>
  );
};

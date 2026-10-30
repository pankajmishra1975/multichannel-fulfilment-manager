import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Check, 
  Info, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  ChevronDown, 
  X, 
  RefreshCw,
  PlusCircle,
  Activity,
  ArrowUp
} from 'lucide-react';
import { ShippingRule, RuleCondition, RuleAction } from '../types';

interface RulesEngineViewProps {
  onRefreshOrders?: () => void;
  onRefreshLogs?: () => void;
  unitSystem?: string;
}

export default function RulesEngineView({ onRefreshOrders, onRefreshLogs, unitSystem = 'imperial' }: RulesEngineViewProps) {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editing state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [rulePriority, setRulePriority] = useState<number>(0);
  const [ruleIsActive, setRuleIsActive] = useState(true);
  const [conditions, setConditions] = useState<RuleCondition[]>([]);
  const [actions, setActions] = useState<RuleAction[]>([]);

  // Condition dropdown fields options
  const conditionFields = [
    { value: 'sku', label: 'Product SKU' },
    { value: 'skuCategory', label: 'SKU Category (e.g. heavy, hazmat)' },
    { value: 'source', label: 'Sales Channel (amazon/ebay)' },
    { value: 'weightOz', label: `Package Weight (${unitSystem === 'metric' ? 'g' : 'oz'})` },
    { value: 'destinationState', label: 'Destination State (e.g. CA, NY)' },
    { value: 'destinationZip', label: 'Destination Zip/Postal Code (starts-with/BT/etc.)' },
    { value: 'destinationCountry', label: 'Destination Country (e.g. US, GB)' },
    { value: 'totalAmount', label: 'Order Total Amount' },
    { value: 'shippingDate', label: 'Shipping Date' }
  ];

  const conditionOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ];

  // Action dropdown options
  const actionTypes = [
    { value: 'assign_carrier', label: 'Assign Shipping Carrier Override' },
    { value: 'assign_service', label: 'Assign Postal Service Name' },
    { value: 'assign_template', label: 'Assign Label Template Override' },
    { value: 'add_tag', label: 'Add Custom Tag' },
    { value: 'add_note', label: 'Add Order Note' },
    { value: 'require_shipping_date', label: 'Require Shipping Date (Tomorrow)' },
    { value: 'set_weight', label: `Set Default Package Weight (${unitSystem === 'metric' ? 'g' : 'oz'})` },
    { value: 'park_order', label: 'Park Order (Hold/Flag as Unshippable)' },
    { value: 'split_order', label: 'Split Order (Proportionally split if quantity > 1)' }
  ];

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shipping-rules');
      const data = await res.json();
      setRules(data.sort((a: ShippingRule, b: ShippingRule) => b.priority - a.priority));
    } catch (e) {
      console.error('Error fetching shipping rules:', e);
      showToast('error', 'Failed to retrieve shipping rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleOpenNewRule = () => {
    setEditingRuleId(null);
    setRuleName('');
    setRuleDescription('');
    setRulePriority(0);
    setRuleIsActive(true);
    setConditions([{ field: 'sku', operator: 'contains', value: '' }]);
    setActions([{ type: 'assign_carrier', value: '' }]);
    setIsFormOpen(true);
  };

  const handleOpenEditRule = (rule: ShippingRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setRuleDescription(rule.description || '');
    setRulePriority(rule.priority || 0);
    setRuleIsActive(rule.isActive !== false);
    setConditions(rule.conditions.length > 0 ? [...rule.conditions] : [{ field: 'sku', operator: 'contains', value: '' }]);
    setActions(rule.actions.length > 0 ? [...rule.actions] : [{ type: 'assign_carrier', value: '' }]);
    setIsFormOpen(true);
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'sku', operator: 'contains', value: '' }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, idx) => idx !== index));
  };

  const handleConditionChange = (index: number, updates: Partial<RuleCondition>) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], ...updates };
    setConditions(updated);
  };

  const handleAddAction = () => {
    setActions([...actions, { type: 'assign_carrier', value: '' }]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, idx) => idx !== index));
  };

  const handleActionChange = (index: number, updates: Partial<RuleAction>) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], ...updates };
    setActions(updated);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      showToast('error', 'Rule name is required.');
      return;
    }
    if (conditions.length === 0) {
      showToast('error', 'At least one condition is required.');
      return;
    }
    if (actions.length === 0) {
      showToast('error', 'At least one action is required.');
      return;
    }

    try {
      const payload: any = {
        name: ruleName,
        description: ruleDescription,
        priority: Number(rulePriority),
        isActive: ruleIsActive,
        conditions,
        actions
      };
      if (editingRuleId) {
        payload.id = editingRuleId;
      }

      const res = await fetch('/api/shipping-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', editingRuleId ? 'Automation rule updated successfully!' : 'Automation rule created successfully!');
        setIsFormOpen(false);
        fetchRules();
        if (onRefreshLogs) onRefreshLogs();
      } else {
        showToast('error', data.error || 'Failed to save shipping rule.');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'An error occurred while saving the rule.');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation rule? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/shipping-rules/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showToast('success', 'Automation rule deleted successfully.');
        fetchRules();
        if (onRefreshLogs) onRefreshLogs();
      } else {
        showToast('error', 'Failed to delete rule.');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'An error occurred while deleting the rule.');
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/shipping-rules/evaluate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `Evaluated rules! Automated and updated ${data.count} pending orders.`);
        if (onRefreshOrders) onRefreshOrders();
        if (onRefreshLogs) onRefreshLogs();
      } else {
        showToast('error', 'Evaluation failed.');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'An error occurred during evaluation.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6" id="rules-engine-main-container">
      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Rules Manager Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Linnworks-Style Automated Shipping Rules
            </h3>
            <p className="text-[11px] text-slate-500">Automate Courier selection, add customer notes, require dispatch dates, and tag matching orders.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button title="Execute RunEvaluation"
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              id="evaluate-rules-btn"
            >
              {evaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Running Evaluation...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  Run Rules Evaluation Now
                </>
              )}
            </button>
            <button title="Execute OpenNewRule"
              onClick={handleOpenNewRule}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              id="create-new-rule-btn"
            >
              <Plus className="w-4 h-4" />
              Add Automation Rule
            </button>
          </div>
        </div>

        {/* Existing Rules Table */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
              <span>Loading registered automation rules...</span>
            </div>
          ) : rules.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <Sliders className="w-10 h-10 text-slate-300 mx-auto mb-2.5 stroke-[1.2]" />
              <h4 className="font-bold text-slate-700 text-xs">No Automation Rules Configured</h4>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1 leading-normal">
                Create automation rules with custom if-then parameters based on item SKUs, destination, and package weight to speed up fulfillment.
              </p>
              <button title="Execute OpenNewRule"
                onClick={handleOpenNewRule}
                className="mt-3 inline-flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-600" /> Configure First Rule
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl" id="rules-table-container">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-16">Priority</th>
                    <th className="py-3 px-4">Rule Name</th>
                    <th className="py-3 px-4">If Conditions (Match All)</th>
                    <th className="py-3 px-4">Then Actions</th>
                    <th className="py-3 px-4 w-24 text-center">Status</th>
                    <th className="py-3 px-4 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-800 text-center">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {rule.priority || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{rule.name}</span>
                        {rule.description && <span className="text-[10px] text-slate-400 block mt-0.5">{rule.description}</span>}
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        {rule.conditions?.map((cond, idx) => (
                          <div key={idx} className="flex flex-wrap items-center gap-1 text-[11px]">
                            <span className="font-semibold text-slate-800 bg-slate-100/80 px-1.5 py-0.2 rounded text-[10px]">
                              {conditionFields.find(f => f.value === cond.field)?.label || cond.field}
                            </span>
                            <span className="text-indigo-600 font-bold text-[10px] lowercase">
                              {conditionOperators.find(o => o.value === cond.operator)?.label || cond.operator}
                            </span>
                            <span className="font-mono bg-amber-50 text-amber-900 px-1.5 py-0.2 rounded text-[10px] border border-amber-100/40">
                              "{cond.value}"
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        {rule.actions?.map((act, idx) => (
                          <div key={idx} className="flex flex-wrap items-center gap-1 text-[11px]">
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] border border-emerald-100/40">
                              {actionTypes.find(a => a.value === act.type)?.label || act.type}
                            </span>
                            {act.value && (
                              <span className="font-bold text-slate-800 text-[10px] bg-slate-100 px-1.5 py-0.2 rounded">
                                → {act.value}
                              </span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          rule.isActive !== false 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {rule.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEditRule(rule)}
                            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded transition-colors"
                            title="Edit rule"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-rose-600 rounded transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Slideover or Dialog for rule formulation */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex justify-end z-50 animate-fade-in" id="rule-form-modal">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in font-sans">
            {/* Form Header */}
            <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Rules Engine</span>
                <h2 className="text-sm font-bold text-white">
                  {editingRuleId ? 'Edit Automation Rule' : 'Create Shipping Rule'}
                </h2>
              </div>
              <button title="Close" 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveRule} className="flex-1 p-6 space-y-6 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Rule Name</label>
                    <input
                      type="text"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      placeholder="e.g. USPS First Class for light products"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-semibold text-slate-800"
                      required
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Priority (Highest first)</label>
                    <input
                      type="number"
                      value={rulePriority}
                      onChange={(e) => setRulePriority(Number(e.target.value))}
                      placeholder="e.g. 10"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-bold text-slate-800 text-center"
                    />
                  </div>

                  <div className="sm:col-span-12 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Rule Description</label>
                    <input
                      type="text"
                      value={ruleDescription}
                      onChange={(e) => setRuleDescription(e.target.value)}
                      placeholder="e.g. Automates postage configuration when parcel weight is less than 13 ounces"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 text-slate-600"
                    />
                  </div>

                  <div className="sm:col-span-12 flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="rule-active-checkbox"
                      checked={ruleIsActive}
                      onChange={(e) => setRuleIsActive(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                    />
                    <label htmlFor="rule-active-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Enable this automation rule (Active)
                    </label>
                  </div>
                </div>

                {/* IF Conditions block */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">IF</span>
                      Conditions (All conditions must match)
                    </h3>
                    <button title="Add new item"
                      type="button"
                      onClick={handleAddCondition}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Condition
                    </button>
                  </div>

                  <div className="space-y-3">
                    {conditions.map((cond, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-2 items-end bg-white p-3 border border-slate-100 rounded-lg relative">
                        {/* Remove condition */}
                        {conditions.length > 1 && (
                          <button title="Close dialog or panel" 
                            type="button"
                            onClick={() => handleRemoveCondition(idx)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="flex-1 space-y-1 w-full">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Field</label>
                          <select
                            value={cond.field}
                            onChange={(e) => handleConditionChange(idx, { field: e.target.value })}
                            className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-semibold text-slate-700"
                          >
                            {conditionFields.map(f => (
                              <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1 space-y-1 w-full">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Operator</label>
                          <select
                            value={cond.operator}
                            onChange={(e) => handleConditionChange(idx, { operator: e.target.value as any })}
                            className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-semibold text-slate-700"
                          >
                            {conditionOperators.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>

                        {cond.operator !== 'is_empty' && cond.operator !== 'is_not_empty' && (
                          <div className="flex-1 space-y-1 w-full">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Value to Match</label>
                            <input
                              type="text"
                              value={cond.value}
                              onChange={(e) => handleConditionChange(idx, { value: e.target.value })}
                              placeholder="e.g. CA or SKU123 or 13"
                              className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-semibold text-slate-800"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* THEN Actions block */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">THEN</span>
                      Perform Actions
                    </h3>
                    <button title="Add new item"
                      type="button"
                      onClick={handleAddAction}
                      className="text-[11px] text-emerald-600 hover:text-emerald-800 font-extrabold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Action
                    </button>
                  </div>

                  <div className="space-y-3">
                    {actions.map((act, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-2 items-end bg-white p-3 border border-slate-100 rounded-lg relative">
                        {/* Remove action */}
                        {actions.length > 1 && (
                          <button title="Close dialog or panel" 
                            type="button"
                            onClick={() => handleRemoveAction(idx)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="flex-1 space-y-1 w-full">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Action Type</label>
                          <select
                            value={act.type}
                            onChange={(e) => handleActionChange(idx, { type: e.target.value as any })}
                            className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-semibold text-slate-700"
                          >
                            {actionTypes.map(a => (
                              <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                          </select>
                        </div>

                        {act.type !== 'require_shipping_date' && act.type !== 'park_order' && act.type !== 'split_order' && (
                          <div className="flex-1 space-y-1 w-full">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Value</label>
                            {act.type === 'assign_carrier' ? (
                              <select
                                value={act.value}
                                onChange={(e) => handleActionChange(idx, { value: e.target.value })}
                                className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-semibold text-slate-700"
                              >
                                <option value="">-- Choose Carrier --</option>
                                <option value="USPS">USPS</option>
                                <option value="UPS">UPS</option>
                                <option value="FedEx">FedEx</option>
                                <option value="DHL">DHL Express</option>
                                <option value="Amazon Shipping">Amazon Shipping Carrier</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={act.value}
                                onChange={(e) => handleActionChange(idx, { value: e.target.value })}
                                placeholder="Value to assign (e.g. Priority Mail, Heavy Item, Tag)"
                                className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-semibold text-slate-800"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button title="Cancel and close" 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button title="Submit form" 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100"
                >
                  Save Automation Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

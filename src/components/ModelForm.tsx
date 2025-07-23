'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Check, Bot, DollarSign, ChevronDown } from 'lucide-react';
import { useModelStore } from '@/stores/useModelStore';
import { ModelFormData } from '@/types';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import ProviderLogo from './ProviderLogo';

const modelSchema = z.object({
  name: z.string().min(1, 'Model name is required'),
  provider: z.string().min(1, 'Provider is required'),
  contextWindow: z.number().min(1, 'Context window must be at least 1'),
  modelType: z.string().min(1, 'Model type is required'),
  inputPrice: z.number().min(0, 'Input price must be positive'),
  outputPrice: z.number().min(0, 'Output price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  region: z.string().optional(),
  notes: z.string().optional(),
});

// Step-specific schemas for validation
const step1Schema = modelSchema.pick({
  name: true,
  provider: true,
  contextWindow: true,
  modelType: true,
});

const step2Schema = modelSchema.pick({
  inputPrice: true,
  outputPrice: true,
  currency: true,
});

interface ModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingModel?: any;
}

// Removed steps - now single form

const providerOptions = [
  { value: '', label: 'Select provider...', logo: null },
  { value: 'OpenAI', label: 'OpenAI', logo: <ProviderLogo provider="OpenAI" size="sm" /> },
  { value: 'Anthropic', label: 'Anthropic', logo: <ProviderLogo provider="Anthropic" size="sm" /> },
  { value: 'Google', label: 'Google', logo: <ProviderLogo provider="Google" size="sm" /> },
  { value: 'Meta', label: 'Meta', logo: <ProviderLogo provider="Meta" size="sm" /> },
  { value: 'Mistral', label: 'Mistral', logo: <ProviderLogo provider="Mistral" size="sm" /> },
  { value: 'Other', label: 'Other', logo: <ProviderLogo provider="Other" size="sm" /> },
];

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

const modelTypeOptions = [
  { value: '', label: 'Select model type...' },
  { value: 'Chat', label: 'Chat (Text-only)' },
  { value: 'Multimodal', label: 'Multimodal (Text + Images)' },
  { value: 'Vision', label: 'Vision (Image Analysis)' },
  { value: 'Audio', label: 'Audio (Speech/Sound)' },
  { value: 'Code', label: 'Code Generation' },
  { value: 'Embedding', label: 'Text Embeddings' },
  { value: 'Other', label: 'Other/Custom' },
];

export default function ModelForm({ isOpen, onClose, editingModel }: ModelFormProps) {
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const { addModel, updateModel } = useModelStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProviderDropdownOpen && !target.closest('.provider-dropdown')) {
        setIsProviderDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProviderDropdownOpen]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    mode: 'onChange',
    defaultValues: {
      name: editingModel?.name || '',
      provider: editingModel?.provider || '',
      contextWindow: editingModel?.contextWindow || 4096,
      modelType: editingModel?.modelType || '',
      inputPrice: editingModel?.inputPrice || 0,
      outputPrice: editingModel?.outputPrice || 0,
      currency: editingModel?.currency || 'USD',
      region: editingModel?.region || '',
      notes: editingModel?.notes || '',
    },
  });


  // Reset form when editingModel changes
  useEffect(() => {
    if (editingModel) {
      reset({
        name: editingModel.name || '',
        provider: editingModel.provider || '',
        contextWindow: editingModel.contextWindow || 4096,
        modelType: editingModel.modelType || '',
        inputPrice: editingModel.inputPrice || 0,
        outputPrice: editingModel.outputPrice || 0,
        currency: editingModel.currency || 'USD',
        region: editingModel.region || '',
        notes: editingModel.notes || '',
      });
    } else {
      reset({
        name: '',
        provider: '',
        contextWindow: 4096,
        modelType: '',
        inputPrice: 0,
        outputPrice: 0,
        currency: 'USD',
        region: '',
        notes: '',
      });
    }
  }, [editingModel, reset]);

  const onSubmit = async (data: ModelFormData) => {
    try {
      if (editingModel) {
        await updateModel(editingModel.id, data);
      } else {
        await addModel(data);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving model:', error);
      // Error is already handled in the store, just prevent form close
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };


  const renderFormContent = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            Basic Information
          </h3>
          
          <Input
            label="Model Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., GPT-4 Turbo"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Platform/Provider
            </label>
            <div className="relative provider-dropdown">
              <button
                type="button"
                onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
                className={`
                  w-full rounded-2xl border-0 bg-white/10 backdrop-blur-md
                  px-4 py-3 text-left text-gray-900 dark:text-white
                  ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50
                  transition-all duration-200 flex items-center justify-between
                  ${errors.provider ? 'ring-red-500/50' : ''}
                `}
              >
                <span className="flex items-center space-x-2">
                  {watch('provider') && <ProviderLogo provider={watch('provider')} size="sm" />}
                  <span className="text-gray-900 dark:text-white">
                    {providerOptions.find(opt => opt.value === watch('provider'))?.label || 'Select platform...'}
                  </span>
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isProviderDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProviderDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-gray-800 rounded-xl shadow-lg border border-white/10 overflow-hidden max-h-60 overflow-y-auto">
                  {providerOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setValue('provider', option.value);
                        setIsProviderDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-2 text-gray-200"
                    >
                      {option.logo}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.provider?.message && (
              <p className="text-sm text-red-500">{errors.provider.message}</p>
            )}
          </div>

          <Input
            label="Context Window (tokens)"
            type="number"
            min="1"
            {...register('contextWindow', { 
              valueAsNumber: true,
              setValueAs: (value) => value === '' ? 4096 : parseInt(value) || 4096
            })}
            error={errors.contextWindow?.message}
            placeholder="e.g., 128000"
          />

          <Select
            label="Model Type"
            {...register('modelType')}
            options={modelTypeOptions}
            error={errors.modelType?.message}
          />
        </div>

        {/* Right Column - Pricing */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing Information
          </h3>
          
          <Input
            label="Input Price (per 1M tokens)"
            type="number"
            step="0.01"
            min="0"
            {...register('inputPrice', { 
              valueAsNumber: true,
              setValueAs: (value) => value === '' ? 0 : parseFloat(value) || 0
            })}
            error={errors.inputPrice?.message}
            placeholder="10.00"
          />
          
          <Input
            label="Output Price (per 1M tokens)"
            type="number"
            step="0.01"
            min="0"
            {...register('outputPrice', { 
              valueAsNumber: true,
              setValueAs: (value) => value === '' ? 0 : parseFloat(value) || 0
            })}
            error={errors.outputPrice?.message}
            placeholder="30.00"
          />
          
          <Select
            label="Currency"
            {...register('currency')}
            options={currencyOptions}
            error={errors.currency?.message}
          />
          
          <Input
            label="Region (optional)"
            {...register('region')}
            error={errors.region?.message}
            placeholder="e.g., US, EU"
          />

          <Input
            label="Notes (optional)"
            {...register('notes')}
            error={errors.notes?.message}
            placeholder="Additional information about this model"
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <GlassCard className="p-0" hover={false}>
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingModel ? 'Edit Model' : 'Add New Model'}
                  </h2>
                  <Button variant="ghost" onClick={handleClose} size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-full">
                <div className="flex-1 overflow-y-auto p-4">
                  {renderFormContent()}
                </div>

                <div className="flex justify-end border-t border-white/10 p-4">
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClose}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!isValid} size="sm">
                      <Check className="h-4 w-4 mr-2" />
                      {editingModel ? 'Update' : 'Add'} Model
                    </Button>
                  </div>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}
    </>
  );
}
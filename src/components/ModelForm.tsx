'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, ArrowRight, ArrowLeft, Check, Bot, DollarSign, Settings, Sparkles } from 'lucide-react';
import { useModelStore } from '@/stores/useModelStore';
import { ModelFormData } from '@/types';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

const modelSchema = z.object({
  name: z.string().min(1, 'Model name is required'),
  provider: z.string().min(1, 'Provider is required'),
  inputPrice: z.number().min(0, 'Input price must be positive'),
  outputPrice: z.number().min(0, 'Output price must be positive'),
  contextWindow: z.number().min(1, 'Context window must be at least 1'),
  currency: z.string().min(1, 'Currency is required'),
  region: z.string().optional(),
  notes: z.string().optional(),
  features: z.array(z.string()).default([]),
  isMultiModal: z.boolean().default(false),
  isVisionEnabled: z.boolean().default(false),
  isAudioEnabled: z.boolean().default(false),
});

interface ModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingModel?: any;
}

const steps = [
  {
    id: 'basic',
    title: 'Basic Info',
    description: 'Model name and provider',
    icon: Bot,
  },
  {
    id: 'pricing',
    title: 'Pricing',
    description: 'Token costs and currency',
    icon: DollarSign,
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Context window and region',
    icon: Settings,
  },
  {
    id: 'features',
    title: 'Features',
    description: 'Capabilities and notes',
    icon: Sparkles,
  },
];

const providerOptions = [
  { value: '', label: 'Select provider...' },
  { value: 'OpenAI', label: 'OpenAI' },
  { value: 'Anthropic', label: 'Anthropic' },
  { value: 'Google', label: 'Google' },
  { value: 'Meta', label: 'Meta' },
  { value: 'Mistral', label: 'Mistral' },
  { value: 'Other', label: 'Other' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

export default function ModelForm({ isOpen, onClose, editingModel }: ModelFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [newFeature, setNewFeature] = useState('');
  const { addModel, updateModel } = useModelStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: '',
      provider: '',
      inputPrice: 0,
      outputPrice: 0,
      contextWindow: 4096,
      currency: 'USD',
      region: '',
      notes: '',
      features: [],
      isMultiModal: false,
      isVisionEnabled: false,
      isAudioEnabled: false,
    },
  });

  const watchedFeatures = watch('features') || [];

  const onSubmit = (data: ModelFormData) => {
    if (editingModel) {
      updateModel(editingModel.id, data);
    } else {
      addModel(data);
    }
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(0);
    reset();
    setNewFeature('');
    onClose();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !watchedFeatures.includes(newFeature.trim())) {
      setValue('features', [...watchedFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setValue('features', watchedFeatures.filter(f => f !== feature));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Input
              label="Model Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="e.g., GPT-4 Turbo"
            />
            <Select
              label="Provider"
              {...register('provider')}
              options={providerOptions}
              error={errors.provider?.message}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Input
              label="Input Price (per 1M tokens)"
              type="number"
              step="0.01"
              {...register('inputPrice', { valueAsNumber: true })}
              error={errors.inputPrice?.message}
              placeholder="10.00"
            />
            <Input
              label="Output Price (per 1M tokens)"
              type="number"
              step="0.01"
              {...register('outputPrice', { valueAsNumber: true })}
              error={errors.outputPrice?.message}
              placeholder="30.00"
            />
            <Select
              label="Currency"
              {...register('currency')}
              options={currencyOptions}
              error={errors.currency?.message}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="Context Window"
              type="number"
              {...register('contextWindow', { valueAsNumber: true })}
              error={errors.contextWindow?.message}
              placeholder="128000"
            />
            <Input
              label="Region (optional)"
              {...register('region')}
              error={errors.region?.message}
              placeholder="e.g., US, EU"
            />
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Capabilities</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('isMultiModal')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Multi-modal</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('isVisionEnabled')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vision</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('isAudioEnabled')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Audio</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features
              </label>
              <div className="flex space-x-2 mb-3">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button variant="secondary" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="hover:bg-blue-500/30 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full rounded-2xl border-0 bg-white/10 backdrop-blur-md px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                placeholder="Additional notes about this model..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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
            className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
          >
            <GlassCard className="p-0">
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {editingModel ? 'Edit Model' : 'Add New Model'}
                  </h2>
                  <Button variant="ghost" onClick={handleClose} size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    
                    return (
                      <div key={step.id} className="flex items-center flex-shrink-0">
                        <div
                          className={`
                            flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200
                            ${isActive ? 'bg-blue-500 text-white' : 
                              isCompleted ? 'bg-green-500 text-white' : 
                              'bg-white/10 text-gray-400'}
                          `}
                        >
                          {isCompleted ? (
                            <Check className="h-2 w-2" />
                          ) : (
                            <Icon className="h-2 w-2" />
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`
                            w-4 h-0.5 mx-1 transition-colors duration-200
                            ${isCompleted ? 'bg-green-500' : 'bg-white/20'}
                          `} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-full">
                <div className="px-3 py-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {steps[currentStep].description}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3">
                  <div className="space-y-2">
                    {renderStepContent()}
                  </div>
                </div>

                <div className="flex justify-between border-t border-white/10 px-3 py-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  
                  {currentStep === steps.length - 1 ? (
                    <Button type="submit" disabled={!isValid} size="sm">
                      <Check className="h-4 w-4" />
                      <span className="hidden sm:inline">{editingModel ? 'Update' : 'Add'} Model</span>
                      <span className="sm:hidden">{editingModel ? 'Update' : 'Add'}</span>
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep} size="sm">
                      <span className="hidden sm:inline">Next</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}
    </>
  );
}
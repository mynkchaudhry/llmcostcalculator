import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import LLMModel from '@/models/LLMModel';
import UserModel from '@/models/UserModel';
import { defaultModels } from '@/data/models';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCustom = searchParams.get('includeCustom') === 'true';
    
    let session = null;
    try {
      await connectToDatabase();
      session = await getServerSession(authOptions);
    } catch (connectionError) {
      console.warn('Database connection failed, using default models:', connectionError);
      // Return default models if database connection fails
      return NextResponse.json({ 
        models: defaultModels.map(model => ({ ...model, isCustom: false }))
      });
    }
    
    let allModels = [];
    
    try {
      // Get public models from database
      const publicModels = await LLMModel.find({ isPublic: true }).lean();
      
      let userModels = [];
      if (session?.user?.id && includeCustom) {
        // Get user's custom models
        userModels = await UserModel.find({ userId: session.user.id }).lean();
      }
      
      // If no public models in database, use default models
      if (publicModels.length === 0) {
        allModels = [
          ...defaultModels.map(model => ({ ...model, isCustom: false })),
          ...userModels.map(model => ({
            id: model.modelId,
            name: model.name,
            provider: model.provider,
            inputPrice: model.inputPrice,
            outputPrice: model.outputPrice,
            contextWindow: model.contextWindow,
            modelType: model.modelType,
            currency: model.currency,
            region: model.region,
            notes: model.notes,
            lastUpdated: model.updatedAt,
            isCustom: true,
          }))
        ];
      } else {
        // Use database models
        allModels = [
          ...publicModels.map(model => ({
            id: model.id,
            name: model.name,
            provider: model.provider,
            inputPrice: model.inputPrice,
            outputPrice: model.outputPrice,
            contextWindow: model.contextWindow,
            currency: model.currency,
            region: model.region,
            notes: model.notes,
            features: model.features,
            lastUpdated: model.lastUpdated,
            isMultiModal: model.isMultiModal,
            isVisionEnabled: model.isVisionEnabled,
            isAudioEnabled: model.isAudioEnabled,
            isCustom: false,
          })),
          ...userModels.map(model => ({
            id: model.modelId,
            name: model.name,
            provider: model.provider,
            inputPrice: model.inputPrice,
            outputPrice: model.outputPrice,
            contextWindow: model.contextWindow,
            modelType: model.modelType,
            currency: model.currency,
            region: model.region,
            notes: model.notes,
            lastUpdated: model.updatedAt,
            isCustom: true,
          }))
        ];
      }
    } catch (dbError) {
      console.warn('Database error, falling back to default models:', dbError);
      // Fallback to default models if database operations fail
      allModels = defaultModels.map(model => ({ ...model, isCustom: false }));
    }

    return NextResponse.json({ models: allModels });
  } catch (error: any) {
    console.error('Get models error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const modelData = await request.json();
    const modelId = `${modelData.provider.toLowerCase()}-${modelData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    const userModel = await UserModel.create({
      userId: session.user.id,
      modelId,
      ...modelData,
    });

    return NextResponse.json(
      { 
        message: 'Model created successfully',
        model: {
          id: userModel.modelId,
          name: userModel.name,
          provider: userModel.provider,
          inputPrice: userModel.inputPrice,
          outputPrice: userModel.outputPrice,
          contextWindow: userModel.contextWindow,
          modelType: userModel.modelType,
          currency: userModel.currency,
          region: userModel.region,
          notes: userModel.notes,
          lastUpdated: userModel.updatedAt,
          isCustom: true,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create model error:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}
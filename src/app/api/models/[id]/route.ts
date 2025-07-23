import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/UserModel';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: modelId } = await params;
    
    const updatedModel = await UserModel.findOneAndUpdate(
      { 
        userId: session.user.id,
        modelId: modelId 
      },
      {
        ...modelData,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedModel) {
      return NextResponse.json(
        { error: 'Model not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Model updated successfully',
      model: {
        id: updatedModel.modelId,
        name: updatedModel.name,
        provider: updatedModel.provider,
        inputPrice: updatedModel.inputPrice,
        outputPrice: updatedModel.outputPrice,
        contextWindow: updatedModel.contextWindow,
        modelType: updatedModel.modelType,
        currency: updatedModel.currency,
        region: updatedModel.region,
        notes: updatedModel.notes,
        lastUpdated: updatedModel.updatedAt,
        isCustom: true,
      }
    });
  } catch (error: any) {
    console.error('Update model error:', error);
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { id: modelId } = await params;
    
    const deletedModel = await UserModel.findOneAndDelete({
      userId: session.user.id,
      modelId: modelId
    });

    if (!deletedModel) {
      return NextResponse.json(
        { error: 'Model not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Model deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete model error:', error);
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}
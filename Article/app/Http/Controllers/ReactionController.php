<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use App\Models\Reaction;

class ReactionController extends Controller
{
    public function react(Request $request, $articleId)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Article::findOrFail($articleId);

        $request->validate([
            'type' => 'required|boolean'
        ]);

        $existing = Reaction::where('user_id', auth()->id())
            ->where('article_id', $articleId)
            ->first();

        // If same reaction exists delete it
        if ($existing && $existing->type == $request->type) {
            $existing->delete();
            return response()->json([
                'deleted' => true,
                'article_id' => $articleId,
                'type' => null
            ]);
        }

        // Otherwise create or update
        $reaction = Reaction::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'article_id' => $articleId
            ],
            ['type' => $request->type]
        );

        return response()->json([
            'deleted' => false,
            'id' => $reaction->id,
            'article_id' => $reaction->article_id,
            'type' => $reaction->type
        ]);
    }

//    public function remove($articleId)
//    {
//        Reaction::where('user_id', auth()->id())
//            ->where('article_id', $articleId)
//            ->delete();
//
//        return response()->json(['message' => 'Reaction removed']);
//    }
}

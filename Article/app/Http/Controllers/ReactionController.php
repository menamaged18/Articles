<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use App\Models\Reaction;

class ReactionController extends Controller
{
    public function react(Request $request, $articleId)
    {
        // TODO: Hanlde this in middleware
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Article::findOrFail($articleId);

        $request->validate([
            'type' => 'required|boolean'
        ]);

        $reaction = Reaction::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'article_id' => $articleId
            ],
            [
                'type' => $request->type
            ]
        );

        return response()->json($reaction);
    }

    public function remove($articleId)
    {
        Reaction::where('user_id', auth()->id())
            ->where('article_id', $articleId)
            ->delete();

        return response()->json(['message' => 'Reaction removed']);
    }
}

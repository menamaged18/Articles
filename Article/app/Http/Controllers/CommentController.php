<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Returns Article comments with the user who wrote them
     */
    public function index(Article $article)
    {
        return $article->comments()->with('user')->latest()->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Article $article)
    {
        $validated = $request->validate([
            'content' => 'required|string|min:2|max:1000',
        ]);

        $comment = $article->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);

        // Load the user relation so the frontend can display the author
        $comment->load('user');

        return response()->json($comment, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comment $comment)
    {
        if (auth()->id() !== $comment->user_id) {
            abort(403, 'You are not authorized to edit this comment.');
        }

        $validated = $request->validate([
            'content' => 'required|string|min:2|max:1000',
        ]);

        $comment->update($validated);

        return response()->json($comment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {
        $user = auth()->user();

        if ($user->id === $comment->user_id || $user->id === $comment->article->user_id) {
            $comment->delete();
            return response()->json(['message' => 'Comment deleted successfully'], 200);
        }

        abort(403, 'Unauthorized action.');
    }
}

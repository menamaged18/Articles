<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Reaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'summary' => 'nullable|string'
        ]);

        $article = Article::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'summary' => $validated['summary'] ?? Str::limit(strip_tags($validated['content']), 150),
            'content' => $validated['content']
        ]);

        return response()->json($article, 201);
    }

    public function index()
    {
        $user = auth('sanctum')->user();

        $articles = Article::select('id', 'user_id', 'title', 'summary', 'created_at' )
        ->with(['user:id,name'])
            ->withCount([
                'reactions as likes_count' => fn($q) => $q->where('type', 1),
                'reactions as dislikes_count' => fn($q) => $q->where('type', 0)
            ])
            ->addSelect([
                'user_reaction' => Reaction::select('type')
                    ->whereColumn('article_id', 'articles.id')
                    ->where('user_id', $user?->id)
                    ->limit(1)
            ])
            ->latest()
            ->paginate(5);

        return response()->json($articles);
    }

    public function userArticles()
    {
        $user = auth('sanctum')->user();

        $articles = Article::where('user_id', $user->id)
            ->select('id', 'user_id', 'title', 'summary', 'created_at') // Exclude content
            ->withCount([
                'reactions as likes_count' => fn($q) => $q->where('type', 1),
                'reactions as dislikes_count' => fn($q) => $q->where('type', 0)
            ])
            ->addSelect([
                'user_reaction' => Reaction::select('type')
                    ->whereColumn('article_id', 'articles.id')
                    ->where('user_id', $user->id)
                    ->limit(1)
            ])
            ->latest()
            ->paginate(5);

        return response()->json($articles);
    }

    // updated show logic to display count of reactions and user reactions
    public function show($id)
    {
        $user = auth('sanctum')->user();

        $article = Article::with('user:id,name')
            ->withCount([
                'reactions as likes_count' => fn($q) => $q->where('type', 1),
                'reactions as dislikes_count' => fn($q) => $q->where('type', 0)
            ])
            ->addSelect([
                'user_reaction' => Reaction::select('type')
                    ->whereColumn('article_id', 'articles.id')
                    ->where('user_id', $user?->id)
                    ->limit(1)
            ])
            ->findOrFail($id);

        return response()->json($article);
    }

    public function update(Request $request, $articleId)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'summary' => 'nullable|string'
        ]);

        $article = Article::findOrFail($articleId);

        $article->update([
            'title' => $validated['title'],
            'summary' => $validated['summary'] ?? Str::limit(strip_tags($validated['content']), 150),
            'content' => $validated['content']
        ]);

        return response()->json($article);
    }

    public function destroy($id)
    {
        Article::destroy($id);
        return response(null, 204);
    }
}

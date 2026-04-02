<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string'
        ]);

        $article = Article::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'content' => $validated['content']
        ]);

        return response()->json($article, 201);
    }

    public function index()
    {
        return Article::with('user')
            ->withCount([
                'reactions as likes_count' => fn($q) => $q->where('type', 1),
                'reactions as dislikes_count' => fn($q) => $q->where('type', 0),
            ])
            ->latest()
            ->get();
    }

    // Single Article by id
    public function show($id)
    {
        return Article::with('user', 'reactions')->findOrFail($id);
    }
}

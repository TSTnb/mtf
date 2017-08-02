#!/usr/bin/env bash
git checkout master;
git merge --no-ff webextension;
git checkout webextension;
git push origin webextension:webextension master:master --tags;
